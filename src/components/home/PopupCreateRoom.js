import React, { useEffect, useState } from 'react';
import './PopupCreateRoom.css';
import { arrayUnion, collection, doc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../dblibs/firebase-config';
import { toast } from 'react-toastify';
import { useUserStore } from '../dblibs/userStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import crypto from 'crypto';
import { useKeyStore } from '../dblibs/privateKeyStore';

const Popup = ({ show, onClose, preName }) => { 
  const {currentUser} = useUserStore();
  const {roomKeys, setRoomKey} = useKeyStore();
  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  let navigate = useNavigate();
  let location = useLocation();

  useEffect(()=>{
    setRoomName(preName || roomName);
  })

  if (!show) {
    return null;
  }

  const redirectToPage = (str) => {
      if (location.pathname !== str)
          navigate(str);
  }

  const handleJoin = async () => {
    // to be moved to functions
    try {

      const response = await httpsCallable(getFunctions(), 'joinChatroom')({
        roomName: roomName,
        password: crypto.createHash('md5').update(roomPassword).digest('base64')
      });

      if (!roomKeys[response.data.id])
        setRoomKey(
          response.data.id,
          crypto.createHash('sha256').update(roomPassword).digest('hex'));

      redirectToPage('/room/' + response.data.id);
      toast.success("Joined room successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="popup-create-room">
      <div className="popup-create-room-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        <input
          type="name"
          id="roomName"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter Room Name"
          required
        />

        <input
          type="password"
          id="roomPassword"
          value={roomPassword}
          onChange={(e) => setRoomPassword(e.target.value)}
          placeholder="Enter Room Password"
          required
        />
        <button className="create-room-button" onClick={handleJoin}>Join Room</button>
      </div>
    </div>
  );
};

export default Popup;
