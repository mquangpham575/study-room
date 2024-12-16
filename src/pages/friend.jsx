import React, {useState} from 'react';
// import './home.css';

import { Profiles } from '../components/home/profiles.jsx';
import { MainHub } from '../components/home/mainHub.jsx';
import { FriendMain } from '../components/home/friendMain.jsx';
// import { ChatMain } from '../components/home/chatMain.jsx';

export const Friend = () => {

  return (
      <div className = "containdo">
        <div/>
        <Profiles/>
        <MainHub displayComponent = {<FriendMain/>}/>
      </div>
  );
}