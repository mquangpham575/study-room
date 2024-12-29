import './homeMain.css';
import { db } from '../dblibs/firebase-config';
import { useUserStore } from '../dblibs/userStore';
import './mainHub.css';
import React, {useEffect, useState} from 'react';
import Popup from './PopupCreateRoom';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { useKeyStore } from '../dblibs/privateKeyStore';

const toggle = (open, setOpen) => {
    setOpen(!open);
}

export const HomeMain = () => {
    const {currentUser} = useUserStore();
    const {roomKeys} = useKeyStore();
    const [showPopup, setShowPopup] = useState(false);
    const [preName, setPreName] = useState(null);

    const [publicRoom, setPublicRoom] = useState([]);
    const [privateRoom, setPrivateRoom] = useState([]);

    console.log('Keys: ', roomKeys);

    const togglePopup = () => {
      setShowPopup(!showPopup);
    };

    let navigate = useNavigate();
    let location = useLocation();

    const handleSearch = async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get("searchtext");

        console.log(username);

        try {
            const qPub = query(collection(db, "chatrooms"),
                where('private', '==', false),
                where('name', '>=', username),
                where('name', '<=', username+'\uf7ff'),
            );

            const qPriv = query(collection(db, "chatrooms"),
                where('members', 'array-contains', currentUser.id),
                where('name', '>=', username),
                where('name', '<=', username+'\uf7ff'),
            );

            const getPub = await getDocs(qPub);
            const getPriv = await getDocs(qPriv);

            console.log(getPub);
            console.log(getPriv);

            if (!getPub.empty)
                setPublicRoom(getPub.docs.map((x)=>{
                    let d = x.data();
                    d.id = x.id;
                    return d
                }));
            else setPublicRoom([])

            if (!getPriv.empty)
                setPrivateRoom(getPriv.docs.map((x)=>{
                    let d = x.data();
                    d.id = x.id;
                    return d
                }));
            else setPrivateRoom([])
    } catch (err) {
            console.log(err);
        }
    }

    const redirectToPage = (str) => {
        if (location.pathname !== str)
            navigate(str);
    }

    useEffect(()=>{
        console.log(publicRoom);

        const unSub = async () => {
            const chatroomRef = collection(db, 'chatrooms');

            const qPub = query(chatroomRef,
                where('private', '==', false),
            );

            const qPriv = query(chatroomRef,
                where('members', 'array-contains', currentUser.id),
            );

            try {
                const getPub = await getDocs(qPub);
                const getPriv = await getDocs(qPriv);
    
                console.log("PUB", getPub);
                console.log("PRIV", getPriv);

                if (!getPub.empty)
                    setPublicRoom(getPub.docs.map((x)=>{
                        let d = x.data();
                        d.id = x.id;
                        return d
                    }));
    
                if (!getPriv.empty)
                    setPrivateRoom(getPriv.docs.map((x)=>{
                        let d = x.data();
                        d.id = x.id;
                        return d
                    }));    
            } catch (err)
            {
                console.log("Error: ", err.message);
            }
        }

        unSub();
    }, []);

    const handleJoinRoom = async (t) => {
        setPreName(t);
        togglePopup();
    }

    return (<div className = 'HomeMain_root'>
        <div className='mainSection'>
            <h1> WELCOME BACK, {currentUser.username}! </h1>
        </div>

        <div className = "homeSeparator"/>
        
        <div className = 'searchBar'>
            <div className = 'compositeSearch'>
            <img src = {"./png/search.png"} alt=""/>
            <form onSubmit={handleSearch} style ={{width: '100%'}}>
                <input type = 'text'
                    placeholder = 'Search'
                    name='searchtext'
                    style ={{width: '100%'}}/>
            </form>

            </div>

            <div className = 'separator'/>
        </div>

        <div/>

        <div className = 'buttonDisplay'>
            <button className="create-room-button" onClick={()=>{redirectToPage('/create')}}>Create Your Room</button>
            <Popup show={showPopup} onClose={togglePopup} preName = {preName} />
            <button className="create-room-button" onClick={togglePopup}> Join room </button>
        </div>

        <div className = 'roomsDisplay'>
            <span> Rooms that you are previously in </span>

            <div className = 'roomDisplay'>
                {privateRoom.map(x=>{
                        console.log(x);

                        return <button className = 'room'
                            onClick={
                                ()=>{
                                    if (roomKeys[x.id])
                                        redirectToPage('/room/' + x.id);
                                    else
                                        handleJoinRoom(x.name);
                                }
                            }>
                            <img src = {x.bgImg || "./png/bg2.jpg"}/>
                            <span>
                                {x.name}
                            </span>
                        </button>
                    })}
            </div>
            <div style = {{'width': '100%', 'height': '1px'}} className = 'homeSeparator'/>

            <span> Public rooms </span>
            <div className = 'roomDisplay'>
                {publicRoom.map(x=>{
                    console.log(x);

                    return <button className = 'room'
                        onClick={()=>{handleJoinRoom(x.name)}}>
                        <img src = {x.bgImg || "./png/bg2.jpg"}/>
                        <span>
                            {x.name}
                        </span>
                    </button>
                })}
            </div>
        </div>

    </div>);
}