import React from 'react';
import './home.css';

import { Profiles } from '../components/home/profiles.jsx';
import { MainHub } from '../components/home/mainHub.jsx';
import { FriendsMain } from '../components/home/friendsMain.jsx';

export const Friends = () => {

  return (
      <div className = "containdo">
        <div/>
        <Profiles/>
        <MainHub displayComponent = {<FriendsMain/>}/>
      </div>
  );
}