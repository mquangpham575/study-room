import { onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "../components/dblibs/userStore";
import { auth } from "../components/dblibs/firebase-config";
import React, {useEffect, useState} from 'react';
import { Navigate } from "react-router-dom";
import { useKeyStore } from "../components/dblibs/privateKeyStore";

export const PrivRoutes = (props) => {
    const {currentUser, isLoading, fetchUserInfo, resetUserInfo} = useUserStore();
    const { id, keys, resetKey} = useKeyStore();
    useEffect( ()=>{
      const unSub = onAuthStateChanged(auth, (user)=> {
        console.log(auth.currentUser);
        if (!user)
        {
          resetUserInfo();
          resetKey();
          return;
        }

        if (id === null || user.uid !== id)
        {
          resetUserInfo();
          resetKey();
          auth.signOut();
          return;
        }

        fetchUserInfo(user.uid);
      });
  
      return () => {
        unSub();
      }
    },[fetchUserInfo]);
    
    if (isLoading) return <div className = 'globalLoad'>TEST LOADING</div>;
  
    console.log("Final: ", id, ' - keys: ', keys);

    return (
      (currentUser
      ? props.targetComponent
      : <Navigate to="/login" replace={true} />
      )
    )
  }
  