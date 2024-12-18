import React from 'react';
import './home.css';

import { Profiles } from '../components/home/profiles.jsx';
import { MainHub } from '../components/home/mainHub.jsx';
import { ProfileMain } from '../components/home/profileMain.jsx';

export const Profile = () => {

  return (
      <div className = "containdo">
        <div/>
        <Profiles/>
        <MainHub displayComponent = {<ProfileMain/>}/>
      </div>
  );
}