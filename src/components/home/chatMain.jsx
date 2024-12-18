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
    arrayRemove} from 'firebase/firestore';

import { db } from '../dblibs/firebase-config.js';
import { useUserStore } from '../dblibs/userStore';
import './chatMain.css';
import React, { useEffect, useState } from 'react';
import { useIndChatStore } from '../dblibs/indChatStore.js';
import { uploadChatImage } from '../dblibs/uploadChatImg.js';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

export const ChatMain = () => {
    const [open, setOpen] = useState(false);
    const [chatters, setChatters] = useState([]);
    const [chatusers, setChatusers] = useState([]);

    const [pointedAt, setPointedAt] = useState(-1);
    const [dropdown, setDropdown] = useState(null);

    const [chat, setChat] = useState(null);
    const {currentUser} = useUserStore();
    const { changeChat, chatId, receiver, reset } = useIndChatStore();

    let navigate = useNavigate();
    let location = useLocation();

    const redirectToPage = (str) => {
        if (location.pathname !== str)
            navigate(str);
    }

    const deleteMessage = async () => {
        if (pointedAt == -1 || chatId == null || chat == null) return;
        const docRef = doc(collection(db, "chats"), chatId);
 
        try {
            await updateDoc(docRef, {
                messages: arrayRemove(chat[pointedAt])
            });

            toast.success("Successfully deleted message!");
        } catch(err)
        {
            toast.error("Can't delete message!");
        }
    }

    const openUI = () => {
        //if (!open) setChatters([]);
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

        console.log(username);

        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", username));

        try {
            const querySnapShot = await getDocs(q)

            if (!querySnapShot.empty)
            {
                console.log(querySnapShot);
                setChatters(querySnapShot.docs);
            } else setChatters([]);

        } catch (err) {
            console.log(err);
        }
    }

    const addUser = async dat => {
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");
        
        try {
            const newChatRef = doc(chatRef);

            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: []
            });

            await updateDoc(doc(userChatsRef, dat.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                })
            });

            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: dat.id,
                    updatedAt: Date.now(),
                })
            });
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
        const userChatsRef = collection(db, "userchats");

        const ids = [currentUser.id, receiver.id];

        try {
            await updateDoc(doc(chatRef, chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    updatedAt: Date.now(),
                    content: {
                        type: "text",
                        cont: text
                    },
                })
            });
        }
        catch (err) {
            console.log(err.message);
            return;
        }

        try {
            ids.forEach(async (id) => {
                const lookdoc = doc(userChatsRef, id);
                const docu = await getDoc(lookdoc);
    
                if (docu.exists())
                {
                    let usrchatData = docu.data();
                    const chatindex = usrchatData.chats.findIndex(
                        c=> c.chatId === chatId
                    );
                    
                    usrchatData.chats[chatindex].lastMessage = currentUser.username + ": " + text;
                    usrchatData.chats[chatindex].isSeen = (id === currentUser.id)? true : false;
                    usrchatData.chats[chatindex].updatedAt = new Date();
    
                    await updateDoc(lookdoc, {
                        chats: usrchatData.chats,
                    });
                }
            });
        }
        catch (err) {
            console.log(err.message);
            return;
        }
    }

    const handleImgSend = async e => {
        if (e.target.files[0])
        {
            const imgUrl = await uploadChatImage(chatId, e.target.files[0]);
            
            const chatRef = collection(db, "chats");
            const userChatsRef = collection(db, "userchats");
    
            const ids = [currentUser.id, receiver.id];
    
            try {
                await updateDoc(doc(chatRef, chatId), {
                    messages: arrayUnion({
                        senderId: currentUser.id,
                        updatedAt: Date.now(),
                        content: {
                            type: "img",
                            cont: imgUrl
                        },
                    })
                });
            }
            catch (err) {
                console.log(err.message);
                return;
            }
    
            try {
                ids.forEach(async (id) => {
                    const lookdoc = doc(userChatsRef, id);
                    const docu = await getDoc(lookdoc);
        
                    if (docu.exists())
                    {
                        let usrchatData = docu.data();
                        let displayText = ": [" + e.target.files[0].name + ']';
                        const chatindex = usrchatData.chats.findIndex(
                            c=> c.chatId === chatId
                        );
                        
                        usrchatData.chats[chatindex].lastMessage = currentUser.username + displayText;
                        usrchatData.chats[chatindex].isSeen = (id === currentUser.id)? true : false;
                        usrchatData.chats[chatindex].updatedAt = new Date();
        
                        await updateDoc(lookdoc, {
                            chats: usrchatData.chats,
                        });
                    }
                });
            }
            catch (err) {
                console.log(err.message);
                return;
            }
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
        console.log(chatId);
        if (chatId == null) return;
        
        const unSub = onSnapshot(doc(db, "chats", chatId), async (res) => {
            const chatContent = res.data();
            setChat(chatContent.messages);
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
                                <button onClick={openUI}>
                                    <img src = {"./png/x-mark.png"} alt=""/>
                                </button>
                            </div>
                        </div>
                        
                        <div className='chat_users'>
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
                        </div>
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

                        let lastMessage = user.lastMessage;

                        if (lastMessage.length > 15)
                        {
                            lastMessage = lastMessage.substring(0, 15) + "...";
                        }

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
                                    <span> {lastMessage} </span>
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
                                key = {index}
                                onMouseEnter={e=>setPointedAt(index)}
                                onMouseLeave={e=>{
                                    if (pointedAt !== -1 && pointedAt === index)
                                    {
                                        setPointedAt(-1);
                                        setDropdown(false);
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
                                        </div>
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
                                        if (dropdown != null)
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
                    <input type = 'text' placeholder = 'Search' name='sendtext'/>
                    <input type = 'image' src = {"./png/send-message.png"} alt="">
                    </input>
                </form>
            </div>}
        </div>
    )
}