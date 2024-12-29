import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

import {PrivRoutes} from './pages/privRoutes.jsx';
import {Login} from './pages/login.jsx';
import { Home } from './pages/home.jsx';
import { Chat } from './pages/chat.jsx';
import { Schedule } from './pages/schedule.jsx';
import { Quiz } from './pages/quiz.jsx';
import { Task } from './pages/task.jsx';
import { Friend } from './pages/friend.jsx';

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { Profile } from './pages/profile.jsx';
import { ChatRoom } from './pages/roomChat.jsx';
import { CreateRoom } from './pages/roomCreate.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace={true} />,
  },

  {
    path: "/login",
    element: <Login/>,
  },

  {
    path: "/home",
    element: <PrivRoutes targetComponent = {<Home/>}/>,
  },

  {
    path: "/chat",
    element: <PrivRoutes targetComponent = {<Chat/>}/>,
  },

  {
    path: "/create",
    element: <PrivRoutes targetComponent = {<CreateRoom/>}/>,
  },

  {
    path: "/room/:id",
    element: <PrivRoutes targetComponent = {<ChatRoom/>}/>,
  },

  {
    path: "/profile/:id",
    element: <PrivRoutes targetComponent = {<Profile/>}/>,
  },

  {
    path: "/schedule/:id",
    element: <PrivRoutes targetComponent = {<Schedule/>}/>,
  },

  {
    path: "/quiz",
    element: <PrivRoutes targetComponent = {<Quiz/>}/>,
  },

  {
    path: "/quiz/:id",
    element: <PrivRoutes targetComponent = {<Quiz/>}/>,
  },

  {
    path: "/task",
    element: <PrivRoutes targetComponent = {<Task/>}/>,
  },

  {
    path: "/friend",
    element: <PrivRoutes targetComponent = {<Friend/>}/>,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);