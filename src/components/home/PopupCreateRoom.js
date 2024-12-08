import React, { useState } from 'react';
import './PopupCreateRoom.css';

const Popup = ({ show, onClose }) => {
  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');

  if (!show) {
    return null;
  }

  return (
    <div className="popup">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        <input
          type="name"
          id="roomName"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter Room Name"
          required
        />
        <label htmlFor="roomPassword">
          <span className="required">Required</span>
        </label>
        <input
          type="password"
          id="roomPassword"
          value={roomPassword}
          onChange={(e) => setRoomPassword(e.target.value)}
          placeholder="Enter Room Password"
          required
        />
        <button className="create-room-button" onClick={onClose}>Create Room</button>
      </div>
    </div>
  );
};

export default Popup;
