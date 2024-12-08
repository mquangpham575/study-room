//import React, {useState} from 'react';
import './home.css';

import { Profiles } from '../components/home/profiles.jsx';
import { MainHub } from '../components/home/mainHub.jsx';
import { QuizApp } from '../components/home/quizMain.jsx';

export const Quiz = () => {

  return (
      <div className = "containdo">
        <div/>
        <Profiles/>
        <MainHub displayComponent = {<QuizApp/>}/>
      </div>
  );
}