import { doc,
    onSnapshot,
    collection,
    query,
    where,
    getDocs, 
    getDoc,
    arrayUnion,
    updateDoc,
    arrayRemove,
    limit} from 'firebase/firestore';

import { db } from '../dblibs/firebase-config.js';
import { useUserStore } from '../dblibs/userStore';
import './chatMain.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useIndChatStore } from '../dblibs/indChatStore.js';
import { uploadChatImage } from '../dblibs/uploadChatImg.js';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useKeyStore } from '../dblibs/privateKeyStore.js';
import { aesDecrypt, aesEncrypt, decrypt, decryptMessage, encrypt } from '../dblibs/pubprivKeys.js';

export const ChatMain = () => {
    const [quizMode, setQuizMode] = useState(false);
    const [quizzes, setQuizzes] = useState([]);

    const [open, setOpen] = useState(false);
    const [chatters, setChatters] = useState([]);
    const [chatusers, setChatusers] = useState([]);

    const [pointedAt, setPointedAt] = useState(-1);
    const [dropdown, setDropdown] = useState(null);

    const [chat, setChat] = useState(null);
    const [orgChat, setOrgChat] = useState(null);

    const [userPubKeys, setUserPubKeys] = useState(null);
    const {currentUser} = useUserStore();
    const { changeChat, chatId, receiver, reset } = useIndChatStore();
    const { keys } = useKeyStore();
    
    const chatRef = useCallback((current)=>{      
        if (current === null) return;

        if (current !== null && current !== undefined ){
            current.scrollIntoView({block: "end", behavior: 'smooth'});
        }
    },[]); 

    let navigate = useNavigate();
    let location = useLocation();

    const redirectToPage = (str) => {
        if (location.pathname !== str)
            navigate(str);
    }

    const deleteMessage = async () => {
        if (pointedAt === -1 || chatId === null || chat === null) return;
        const docRef = doc(collection(db, "chats"), chatId);
        console.log(orgChat[pointedAt]);

        try {
            await updateDoc(docRef, {
                messages: arrayRemove(orgChat[pointedAt])
            });

            toast.success("Successfully deleted message!");
        } catch(err)
        {
            toast.error("Can't delete message!");
        }
    }

    const openUI = () => {
        setOpen(!open);
    };

    const renderOverlay = (e) => {
        const chatArena = e.currentTarget.parentElement.parentElement;

        setDropdown(
            <div style = {{
                position: 'absolute',
                top: e.currentTarget.offsetTop + 25 - chatArena.scrollTop,
                left: e.currentTarget.offsetLeft,
                'z-index': 2,
                'background-color': 'green',
            }}>        
                <div className={"dropdown-content"}>
                    <button onClick={deleteMessage}> Delete </button>
                </div>
            </div>
        );
    }

    const searchUser = async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get("name");

        const userRef = collection(db, "users");

        try {
            let q, querySnapShot;
            let setter = setChatters;
            let dat;

            if (quizMode)
            {
                setter = setQuizzes;

                q = query(collection(db, "quizzes"),
                    where('owner', '==', currentUser.id),
                    where('quizName', '>=', username),
                    where('quizName', '<=', username+'\uf7ff'),
                    limit(20)
                );
                querySnapShot = await getDocs(q);
                
                dat = querySnapShot.docs.map(x=>{
                    let d = x.data();
                    d.id = x.id;
                    return d;
                });
            } else {
                q = query(userRef,
                    where('id', '!=', currentUser.id),
                    where('username', '>=', username),
                    where('username', '<=', username+'\uf7ff'),
                    limit(20)
                );

                querySnapShot = await getDocs(q);
                dat = querySnapShot.docs;
            }

            if (!querySnapShot.empty)
                {
                    setter(dat);
                } else setter([]);
        } catch (err) {
            console.log(err);
        }
    }

    const addUser = async dat => {
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");
        
        try {
            const newChatRef = doc(chatRef);
            toast.info('Adding user...');

            await httpsCallable(getFunctions() , 'makeRoom')({userBid: dat.id});

            toast.info('User added!');
        }
        catch (err) {
            console.log(err.message);
        }
    }

    const getUserChat = async dat => {
        console.log(dat);

        changeChat( dat.chatId , dat.user );
    }

    const handleSend = async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const text = formData.get("sendtext");
        
        if (text.length === 0) return;
        e.target.reset();

        const chatRef = collection(db, "chats");

        try {

            // const encrypted = aesEncrypt(text, userPubKeys.key, userPubKeys.iv);
            // console.log('Encrypted: ', encrypted);
            // const decrypted = aesDecrypt(encrypted, userPubKeys.key, userPubKeys.iv);
            // console.log('Decrypted: ', decrypted)
            await updateDoc(doc(chatRef, chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    updatedAt: Date.now(),
                    content: {
                        type: "text",
                        cont: aesEncrypt(text, userPubKeys.key, userPubKeys.iv)
                    },
                })
            });
        }
        catch (err) {
            toast.error(err.message);
            return;
        }
    }

    const handleImgSend = async e => {
        if (e.target.files[0])
        {
            const imgUrl = await uploadChatImage(chatId, e.target.files[0]);
            
            const chatRef = collection(db, "chats");
        
            try {
                await updateDoc(doc(chatRef, chatId), {
                    messages: arrayUnion({
                        senderId: currentUser.id,
                        updatedAt: Date.now(),
                        content: {
                            type: "img",
                            cont: aesEncrypt(imgUrl, userPubKeys.key, userPubKeys.iv)   
                        },
                    })
                });
            }
            catch (err) {
                console.log(err.message);
                return;
            }
        }
    }

    const handleQuizSend = async dat => {
        const chatRef = collection(db, "chats");

        try {
            await updateDoc(doc(chatRef, chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    updatedAt: Date.now(),
                    content: {
                        type: "quiz",
                        name: aesEncrypt(dat.quizName, userPubKeys.key, userPubKeys.iv) ,
                        id: aesEncrypt(dat.id, userPubKeys.key, userPubKeys.iv),
                    },
                })
            });
        }
        catch (err) {
            console.log(err.message);
            return;
        }
    }

    const handleScSend = async () => {        
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");

        const ids = [currentUser.id, receiver.id];

        try {
            await updateDoc(doc(chatRef, chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    updatedAt: Date.now(),
                    content: {
                        type: "schedule",
                        cont: '/'
                    },
                })
            });
        }
        catch (err) {
            console.log(err.message);
            return;
        }
    }

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
            const items = res.data().chats;

            const promises = items.map(async (detail)=> {
                const userDocRef = doc(db, "users", detail.receiverId);
                const userDocSnap = await getDoc(userDocRef);

                const user = userDocSnap.data();

                return {...detail, user}
            });

            const chatData = await Promise.all(promises)

            setChatusers(chatData.sort((a,b)=>b.updatedAt - a.updatedAt));

            console.log(chatData);
        })

        return ()=> {
            unSub();
        }
    }, [currentUser.id]);

    useEffect(()=>{
        if (chatId === null) return;
        
        const unSub = onSnapshot(doc(db, "chats", chatId), async (res) => {
            let chatContent = res.data();
            const runTime = chatContent.messages.length - chat?.length || 0;

            const fetchedAES = chatContent.keys[currentUser.id];

            let AESprop = {
                iv: decrypt(fetchedAES.iv, keys.privateKey, 'hex'),
                key: decrypt(fetchedAES.key, keys.privateKey, 'hex')
            };
            
            const copy = res.data().messages;

            if (chat === null || chatId !== res.id || runTime <= 0)
            {
                for (let i in chatContent.messages)
                {
                    let message = chatContent.messages[i];
                    if (message.content.type === 'schedule') continue;

                    if (message.content.type !== 'quiz') {
                        message.content.cont = decryptMessage(message,
                        AESprop.key,
                        AESprop.iv);
                        
                        continue;
                    }
                    
                    const obj = message.content.cont = decryptMessage(message,
                                AESprop.key,
                                AESprop.iv);

                    message.content.name = obj.name;
                    message.content.id = obj.id;
                }

                setChat(chatContent.messages);
            } else {
                let clone = chat.concat();

                if (runTime > 0) {
                    for (let i = chat.length; i < chatContent.messages.length; i++) {
                        let message = chatContent.messages[i];
                        
                        if (message.content.type === 'schedule') {
                            clone.push(message);
                            continue;
                        }

                        if (message.content.type !== 'quiz') {
                            message.content.cont = decryptMessage(message,
                            userPubKeys.key,
                            userPubKeys.iv);
                            
                            clone.push(message);
                            continue;
                        }
                        
                        const obj = message.content.cont = decryptMessage(message,
                                    userPubKeys.key,
                                    userPubKeys.iv);
    
                        message.content.name = obj.name;
                        message.content.id = obj.id;    
                        
                        clone.push(message);
                    }

                    setChat(clone);
                }
            }

            setOrgChat(copy);
            setUserPubKeys(AESprop);
        })

        return ()=> {
            unSub();
        }
    },[chatId]);

    useEffect(()=>reset(), []);

    return (            
        <div className='chat_ui'>
            {open &&
                <div className = 'chat_findUser'>
                    <div className='chat_findUI'>
                        <div className='chat_search'>
                            <div>
                                <img src = {"./png/search.png"} alt=""/>
                                <form onSubmit={searchUser}>
                                    <input type = 'text' placeholder = 'Search' name = 'name'/>
                                </form>
                                <button onClick={()=>{setQuizMode(false); openUI();}}>
                                    <img src = {"./png/x-mark.png"} alt=""/>
                                </button>
                            </div>
                        </div>
                        
                        {!quizMode? <div className='chat_users'>
                        {
                            chatters.map((x) => {
                                const dat = x.data();

                                return (
                                <button 
                                    style = {{cursor: 'pointer'}}
                                    className = 'chat_userDisplay'
                                    onClick = {()=>{addUser(dat)}}>
                                    <div>
                                        <img src = {dat.avatar || "./png/user.png"} alt=""/>
                                    </div>
                                    <div className='chat_userSep'> </div>
                                    <div className='chat_userInfSearch'>
                                        <p> {dat.username} </p>
                                    </div>
                                </button>
                            )})
                        }
                        </div> :
                        <div className='chat_users'>
                        {
                            quizzes.map((x) => {
                                const dat = x;

                                return (
                                <button 
                                    style = {{
                                        cursor: 'pointer',
                                        height: 'auto'
                                    }}
                                    className = 'chat_userDisplay'
                                    onClick = {()=>{handleQuizSend(dat)}}>
                                    <div className='chat_userSep'> </div>
                                    <div className='chat_userInfSearch'>
                                        <p> {"Quiz : " + dat.quizName} </p>
                                        <p> {"Time limit : " + dat.timeLimit +'s'} </p>
                                        <p style = {{
                                            color: 'gray',
                                            'font-size': '11px',
                                            'font-style': 'italic'
                                        }}> {"ID : " + dat.id} </p>
                                    </div>
                                </button>
                            )})
                        }
                        </div>
                        }
                    </div>
                </div>}
        
            <div className='chat_navbar'>
                <div className='chat_search'>
                    <div>
                        <img src = {"./png/search.png"} alt=""/>
                        <input type = 'text' placeholder = 'Search'/>
                        <button onClick = {openUI}>
                            <img src = {"./png/add.png"} alt=""/>
                        </button>
                    </div>
                </div>
                
                <div className='chat_users'>
                    {chatusers.map((user) => {

                        return (
                        <div
                            className = 'chat_userDisplay'
                            key={user.chatId}>
                            <button onClick={() => redirectToPage("/profile/" + user.user.id)}>
                                <img src = {user.user.avatar || "./png/user.png"} alt=""/>
                            </button>
                            <div className='chat_userSep'/>
                            <button onClick={()=>{getUserChat(user)}}                            >
                                <div>
                                    <p> {user.user.username} </p>
                                </div>
                            </button>
                        </div>)
                    })}
                </div>
            </div>

            {chatId && <div className='chat_bar'>
                <div className = 'chat_chatArena'>
                    {chat?.map((message, index)=>{
                        let cont = '';

                        if (message.senderId === currentUser.id)
                            cont = ' Self';  
                        
                        return (
                            <div className = {'chatComp' + cont}
                                ref = {chat.length - 1 === index? chatRef : null}
                                key = {index}
                                onMouseEnter={e=>setPointedAt(index)}
                                onMouseLeave={e=>{
                                    if (pointedAt !== -1 && pointedAt === index)
                                    {
                                        setPointedAt(-1);
                                        setDropdown(null);
                                    }
                                }}>

                                {{
                                    'text': <div className={'chat_TextBox'+cont}>
                                            <div className ='chat_text'>
                                                <p> {message.content.cont} </p>
                                            </div>
                                        </div>,
                                    'img': <div className={'chat_TextBox'+cont}>
                                            <div className ='chat_text'>
                                                <img src = {message.content.cont} alt=""/>
                                            </div>
                                        </div>,
                                    'schedule': <div className={'chat_ScBox'+cont}>
                                            <button onClick={() => redirectToPage("/schedule/" + message.senderId)}>
                                                Enter
                                            </button>
                                            <div className = 'chat_scSep'> </div>
                                            <div className = 'chat_scInfo'>
                                                <span> Take a look at my schedule! </span>
                                            </div>
                                        </div>,
                                    'quiz': <div className={'chat_QuizBox'+cont}>
                                            <button
                                                onClick={() => redirectToPage("/quiz/" + message.content.id)}>
                                                Enter
                                            </button>
                                            <div className = 'chat_quizSep'> </div>
                                            <div className = {'chat_quizInfo'+cont}>
                                                <h2> {message.content.name} </h2>
                                                <span> Take a look at my quiz!</span>
                                            </div>
                                        </div>,
                                }[message.content.type]}

                                {message.senderId === currentUser.id && index === pointedAt && <button
                                    style = {{
                                        'background-color' : 'transparent',
                                        border: 'none',
                                        'margin-left': '15px',
                                        'margin-right': '15px',
                                        }
                                    }
                            
                                    onClick={e=>{
                                        console.log(dropdown);

                                        if (dropdown == null)
                                            renderOverlay(e);
                                        else
                                            setDropdown(null);
                                    }}>
                                                                            
                                    <img className = 'more' src = "./png/more.png" alt=""/>
                                    
                                    {dropdown}
                                </button>}
                            </div>
                        );
                    })}
                </div>

                <form className = 'chat_chatBar' onSubmit={handleSend}>
                    <label htmlFor='file'>
                        <img src = "./png/image.png" alt=""/>
                    </label>

                    <input type = "file" id="file"
                        accept=".jpg,.jpeg,.png" style={{display:"none"}}
                        onChange={handleImgSend}/>

                    <button type='button'
                        onClick = {async ()=>{
                            setQuizMode(true);
                            openUI();

                            const querySnapshot = await getDocs(
                                query(collection(db, 'quizzes'),
                                where("owner", "==", currentUser.id),
                                limit(20)
                            ));

                            const fetchedQuizzes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()  }));
                            
                            setQuizzes(fetchedQuizzes);
                        }}> 
                        <img src = "./png/choose.png" alt=""/>
                    </button>

                    <button type='button'
                        onClick = {handleScSend}> 
                        <img src = "./png/schedule.png" alt=""/>
                    </button>

                    <input type = 'text' placeholder = 'Search' name='sendtext'/>
                    <input type = 'image' src = {"./png/send-message.png"} alt="">
                    </input>
                </form>
            </div>}
        </div>
    )
}