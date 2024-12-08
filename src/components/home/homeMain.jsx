import './homeMain.css';
//import { auth } from '../dblibs/firebase-config';
import { useUserStore } from '../dblibs/userStore';
import './mainHub.css';
import React, {useState} from 'react';
import Popup from './PopupCreateRoom';

const toggle = (open, setOpen) => {
    setOpen(!open);
}

export const HomeMain = () => {
    const {currentUser} = useUserStore();
    const [open, setOpen] = useState(false);

    const [showPopup, setShowPopup] = useState(false);

    const togglePopup = () => {
      setShowPopup(!showPopup);
    };
    
    return (<div className = 'HomeMain_root'>
        <div className='mainSection'>
            <h1> WELCOME BACK, {currentUser.username}! </h1>
        </div>

        <div className = "separator"/>
        
        <div className = 'searchBar'>
            <div>
            <img src = {"./png/search.png"} alt=""/>
            <input type = 'text' placeholder = 'Search'/>
            </div>

            <div className = 'separator'/>

            <button type="button"
            className="collapsible"
            onClick={() => toggle(open, setOpen)}
            >
            <img src = {"./png/filter.png"} alt=""/>

            {open && <div className="content">
                <p>Lorem ipsum...</p>
            </div>}

            </button>
        </div>

        <div className = 'buttonDisplay'>
            <button className="create-room-button" onClick={togglePopup}>Create Your Room</button>
            <Popup show={showPopup} onClose={togglePopup} />
            <button className="join-room-button"> Join room </button>
        </div>

        <div/>
        <div className = 'roomDisplay'>
            <div className = 'room'> </div>

        </div>


    </div>);
}