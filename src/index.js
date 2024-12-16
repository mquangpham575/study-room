import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

import {Login} from './pages/login.jsx';
import {PrivRoutes} from './pages/privRoutes.jsx';
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
    path: "/schedule",
    element: <PrivRoutes targetComponent = {<Schedule/>}/>,
  },

  {
    path: "/quiz",
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