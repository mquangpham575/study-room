import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

import {Login} from './pages/login.jsx';
import {PrivRoutes} from './pages/privRoutes.jsx';
import { Home } from './pages/home.jsx';
import { Chat } from './pages/chat.jsx';
import { Friends } from './pages/friends.jsx';

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
    path: "/friends",
    element: <PrivRoutes targetComponent = {<Friends/>}/>,
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
    path: "/room",
    element: <PrivRoutes targetComponent = {<ChatRoom/>}/>,
  },

  {
    path: "/profile/:id",
    element: <PrivRoutes targetComponent = {<Profile/>}/>,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);