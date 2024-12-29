import { doc,
    onSnapshot,
    collection,
    query,
    where,
    getDocs, 
    getDoc,
    serverTimestamp,
    setDoc,
    arrayUnion,
    updateDoc,
    arrayRemove,
    deleteDoc,
    limit} from 'firebase/firestore';

import { db } from '../dblibs/firebase-config.js';
import { useUserStore } from '../dblibs/userStore';
import './chatroomMain.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useIndChatStore } from '../dblibs/indChatStore.js';
import { uploadChatImage, uploadCustomImage } from '../dblibs/uploadChatImg.js';
import { redirect, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useChatroomStore } from '../dblibs/chatRoomStore.js';
import { toast } from 'react-toastify';

import crypto from 'crypto';
import { useKeyStore } from '../dblibs/privateKeyStore.js';
import { aesEncrypt } from '../dblibs/pubprivKeys.js';

export const ChatroomMain = () => {
    const {currentUser} = useUserStore();
    const {roomKeys} = useKeyStore();
    const {chatId, roomInformation, changeChat, rawFetch} = useChatroomStore();

    const [chatUsers, setChatUsers] = useState([]);
    const [dropdown, setDropdown] = useState(false);
    const [textSearch, setTextSearch] = useState('');
    const [aesKey, setAesKey] = useState(null);
    
    const [quizzes, setQuizzes] = useState([]);
    const [open, setOpen] = useState(false);

    const id = useParams().id;
    const [pointedAt, setPointedAt] = useState(-1);
    const [orgChat, setOrgChat] = useState(null);

    let navigate = useNavigate();
    let location = useLocation();

    const redirectToPage = (str) => {
        if (location.pathname !== str)
            navigate(str);
    }

    const chatRef = useCallback((current)=>{
        if (current === null) return;

        if (current !== null && current !== undefined ){
            current.scrollIntoView({block: "end", behavior: 'smooth'});
        }
    },[]); 

    useEffect(()=>{
        changeChat(id);
    }, [])

    useEffect(()=> {
        if (chatId === null) return;

        const unSub = onSnapshot(doc(db, 'chatrooms', chatId), async (doc)=>{
            try {
                const q = query(collection(db, 'users'),
                where('id', 'in', doc.data().members),
                where('id', '!=', currentUser.id));
                
                setOrgChat(doc.data());

                const users = await getDocs(q);
                let finale = aesKey;

                if (!aesKey)
                {
                    console.log("HASH ", roomKeys[chatId]);

                    let cipher = crypto.createDecipheriv('aes-256-cbc',
                        Buffer.from(roomKeys[chatId], 'hex'),
                        Buffer.from(doc.data().iv, 'hex'));
                    let ciphered = cipher.update(doc.data().encryptedAesKey, 'hex', 'hex');
                    finale = {
                        iv: doc.data().iv,
                        key: ciphered + cipher.final('hex')
                    };

                    setAesKey(finale);
                }

                if (users.empty)
                {
                    rawFetch(doc.id, doc.data(), finale);
                    console.log([currentUser]);
                    setChatUsers([currentUser]);
                    return;
                }

                let fetchedUsers = users.docs.map(x=>x.data());
                fetchedUsers.push(currentUser);
                
                console.log(fetchedUsers);

                rawFetch(doc.id, doc.data(), finale);
                setChatUsers(fetchedUsers);
            } catch(err)
            {
                console.log(err.message);
            }
        });

        return ()=>{unSub()};
    }, [chatId]);

    const handleDisband = async() => {
        if (currentUser.id !== roomInformation.owner) return;

        try {
            await deleteDoc(doc(db, 'chatrooms', chatId));
            redirectToPage('/home');
        } catch (err) {
            toast.error('Error: '+err.message);
        }
    }

    const handleLeave = async() => {
        try {
            await updateDoc(doc(db, 'chatrooms', chatId), {
                members: arrayRemove(currentUser.id)
            })

            toast.success('Left room successfully!');
            redirectToPage('/home');
        } catch (err) {
            toast.error('Error:', err);
        }
    }
    
    const handleSearch = async (e) => {
        console.log(e.target.value);
        setTextSearch(e.target.value);
    }

    const searchUser = async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get("name");

        const userRef = collection(db, "users");

        try {
            let q, querySnapShot;
            let setter = setQuizzes;
            let dat;

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

            if (!querySnapShot.empty)
                {
                    setter(dat);
                } else setter([]);
        } catch (err) {
            console.log(err);
        }
    }

    const deleteMessage = async () => {
        if (pointedAt === -1 || chatId === null || roomInformation ===null) return;
        const docRef = doc(collection(db, "chatrooms"), chatId);
 
        try {
            await updateDoc(docRef, {
                messages: arrayRemove(orgChat.messages[pointedAt])
            });

            toast.success("Successfully deleted message!");
        } catch(err)
        {
            toast.error("Can't delete message!");
        }
    }

    const handleSend = async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const text = formData.get("sendtext");
        
        if (text.length === 0) return;
        e.target.reset();

        const chatRef = collection(db, "chatrooms");

        try {

            console.log(aesKey.key);

            await updateDoc(doc(chatRef, chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    updatedAt: Date.now(),
                    content: {
                        type: "text",
                        cont: aesEncrypt(text, aesKey.key, aesKey.iv)
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
            const imgUrl = await uploadCustomImage('chatrooms/'+chatId, e.target.files[0]);
            
            const chatRef = collection(db, "chatrooms");
        
            try {
                await updateDoc(doc(chatRef, chatId), {
                    messages: arrayUnion({
                        senderId: currentUser.id,
                        updatedAt: Date.now(),
                        content: {
                            type: "img",
                            cont: aesEncrypt(imgUrl, aesKey.key, aesKey.iv)
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
        const chatRef = collection(db, "chatrooms");

        try {
            await updateDoc(doc(chatRef, chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    updatedAt: Date.now(),
                    content: {
                        type: "quiz",
                        name: aesEncrypt(dat.quizName, aesKey.key, aesKey.iv),
                        id: aesEncrypt(dat.id, aesKey.key, aesKey.iv),
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
        const chatRef = collection(db, "chatrooms");

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

    if (chatId === null || roomInformation === null)
    {
        return <div className = 'globalLoad'> LOADING </div>
    }

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

    return (
        <div className='chatr_ui'
            style = {{
                'background-image': 'url('+roomInformation.bgImg+')',
            }}>
            
            {open &&
                <div className = 'chat_findUser'>
                    <div className='chat_findUI'>
                        <div className='chatroom_search'>
                            <div className='chatroom_searchInside'>
                                <img src = {"../png/search.png"} alt=""/>
                                <form onSubmit={searchUser}>
                                    <input type = 'text' placeholder = 'Search' name = 'name'/>
                                </form>
                                <button onClick={()=>{setOpen(!open);}}>
                                    <img src = {"../png/x-mark.png"} alt=""/>
                                </button>
                            </div>
                        </div>
                        
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
                    </div>
                </div>}

            <div className='chat_navbar'>
                <div className='chat_info'>
                    <div>
                        <p> {"Room: " + roomInformation.name} </p>
                        <p> {"Members: " + roomInformation.members.length + '/' +roomInformation.limit} </p>
                    </div>
                </div>

                <div className='chatroom_search'>
                    <div className = 'chatroom_searchInside'>
                        <img src = {"../png/search.png"} alt=""/>
                        <form>
                            <input type = 'text'
                                onChange={handleSearch}
                                placeholder = 'Search'/>
                        </form>
                    </div>
                </div>

                <div className='chat_users'>
                {chatUsers.map((user) => {
                    if (textSearch !== '' && !user.username.includes(textSearch)) return;
                    return (
                    <div
                        className = 'chat_userDisplay'
                        key={user.chatId}>
                        <button onClick={() => redirectToPage("/profile/" + user.id)}>
                            <img src = {user.avatar || "./png/user.png"} alt=""/>
                        </button>
                        <div className='chat_userSep'/>
                        <div>
                            <div>
                                <p> {user.username} </p>
                            </div>
                        </div>
                    </div>)
                    })}
                </div>

                <div className='chat_leave'>
                    {roomInformation.owner === currentUser.id ? <button
                        onClick={handleDisband}>
                        Disband
                    </button> :
                    <button onClick={handleLeave}>
                        Leave
                    </button>                
                    }

                </div>
            </div>

            <div className='chat_bar' >
                <div className = 'chat_chatArena'>
                {roomInformation?.messages?.map((message, index)=>{
                        let cont = '';

                        if (message.senderId === currentUser.id)
                            cont = ' Self';  
                        
                        return (
                            <div className = {'chatComp' + cont}
                                ref = {roomInformation.messages.length - 1 === index? chatRef : null}
                                key = {index}
                                onMouseEnter={e=>setPointedAt(index)}
                                onMouseLeave={e=>{
                                    if (pointedAt !== -1 && pointedAt === index)
                                    {
                                        setPointedAt(-1);
                                        setDropdown(null);
                                    }
                                }}>
                                
                                <button className='userIcon'>
                                    <img
                                    src = {
                                        chatUsers?.find(x=>
                                            x.id === message.senderId)?.avatar
                                        || "../png/user.png"} alt=""/>
                                </button>

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
                                                                            
                                    <img className = 'more' src = "../png/more.png" alt=""/>
                                    
                                    {dropdown}
                                </button>}
                            </div>
                        );
                    })}
                </div>

                <form className = 'chat_chatBar' onSubmit={handleSend}>
                    <label htmlFor='file'>
                        <img src = "../png/image.png" alt=""/>
                    </label>

                    <input type = "file" id="file"
                        accept=".jpg,.jpeg,.png" style={{display:"none"}}
                        onChange={handleImgSend}/>

                    <button type='button'
                        onClick = {async ()=>{
                            setOpen(!open);

                            const querySnapshot = await getDocs(
                                query(collection(db, 'quizzes'),
                                where("owner", "==", currentUser.id),
                                limit(20)
                            ));

                            const fetchedQuizzes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()  }));
                            
                            setQuizzes(fetchedQuizzes);
                        }}> 
                        <img src = "../png/choose.png" alt=""/>
                    </button>

                    <button type='button'
                        onClick = {handleScSend}> 
                        <img src = "../png/schedule.png" alt=""/>
                    </button>

                    <input type = 'text' placeholder = 'Search' name='sendtext'/>
                    <input type = 'image' src = {"../png/send-message.png"} alt="">
                    </input>
                </form>
            </div>
        </div>
    )
}