//import React, {useState} from 'react';
import './home.css';

import { Profiles } from '../components/home/profiles.jsx';
import { MainHub } from '../components/home/mainHub.jsx';
import { QuizApp } from '../components/home/quizMain.jsx';
import { useParams } from 'react-router-dom';

export const Quiz = () => {
  const id = useParams().id;

  return (
      <div className = "containdo">
        <div/>
        <Profiles/>
        <MainHub displayComponent = {<QuizApp quizId = {id}/>}/>
      </div>
  );
}