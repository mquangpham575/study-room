import React from 'react';
import './home.css';

import { Profiles } from '../components/home/profiles.jsx';
import { MainHub } from '../components/home/mainHub.jsx';
import { ChatroomMain } from '../components/home/chatroomMain.jsx';

export const ChatRoom = () => {

  return (
      <div className = "containdo">
        <div/>
        <Profiles/>
        <MainHub displayComponent = {<ChatroomMain/>}/>
      </div>
  );
}