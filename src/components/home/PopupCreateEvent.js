import React, { useState } from 'react';
import './PopupCreateRoom.css';

const Popup = ({ show, onClose }) => {
  const [EventName, setEventName] = useState('');
  const [TimeStart, setTimeStart] = useState('');
  const [TimeEnd, setTimeEnd] = useState('');

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
          value={EventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Enter Event Name"
          required
        />
        <input
          type="datetime-local"
          id="startTime"
          value={TimeStart}
          onChange={(e) => setTimeStart(e.target.value)}
          placeholder="Enter Event Time Start"
          required
        />
        <input
          type="datetime-local"
          id="endTime"
          value={TimeEnd}
          onChange={(e) => setTimeEnd(e.target.value)}
          placeholder="Enter Event Time End"
          required
        />
        <button className="create-room-button" onClick={onClose}>Create Event</button>
      </div>
    </div>
  );
};

export default Popup;
