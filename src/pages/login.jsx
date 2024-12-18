import {Notification} from '../components/notification/notification.jsx';
import './login.css';

import { toast } from 'react-toastify';
import {auth, provider, db} from '../components/dblibs/firebase-config.js';
import { uploadImage } from '../components/dblibs/uploadImage.js';
import {onAuthStateChanged, signInWithPopup} from 'firebase/auth';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword } from 'firebase/auth';
import {collection, doc, getDocs, query, setDoc, where} from 'firebase/firestore';

import {useEffect, useState} from 'react';
import { useUserStore } from '../components/dblibs/userStore.js';
import {
    Navigate,
  } from "react-router-dom";

export const Auth = (props) => {
    const [avatar, setAvatar] = useState({
        file:null,
        url:""
    });

    const handleAvatar = e => {
        if (e.target.files[0])
            setAvatar({
                file:e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
    }

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, provider)
            .then(async (res) => {
                props.fetchUserInfo(res.user.uid);

                const username = res.user.displayName;
                const email = res.user.email;
                
                const userRef = collection(db, "users");
                const q = query(userRef, where("id", "==", res.user.uid));
                const querySnapShot = await getDocs(q)        

                if (!querySnapShot.empty) return;

                await setDoc(
                    doc(db, "users", res.user.uid), {
                        username,
                        avatar: res.user.photoURL,
                        email,
                        id : res.user.uid,
                        blocked:[],
                        friends:[]
                    }
                )
    
                await setDoc(
                    doc(db, "userchats", res.user.uid), {
                        chats:[],
                    }
                )

                toast.success("Success! Logging in...")
            })
        }
        catch(err) {
            toast.error(err.message);
        }
    }

    const handleNormalLogin = async(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const {email, password} = Object.fromEntries(formData);

        await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            props.fetchUserInfo(user.uid);

            toast.success("Success! Logging in...")
          })
          .catch((err) => {
            toast.error(err.message);
          });
    }

    const handleRegister = async(e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const {username, email, password} = Object.fromEntries(formData);

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            let imgUrl = "https://firebasestorage.googleapis.com/v0/b/testyappayappadoo.firebasestorage.app/o/avatars%2FdefaultImage.png?alt=media&token=bf049c85-3319-453f-b866-147aefded51b";

            if (avatar.file)
                imgUrl = await uploadImage(avatar.file);

            await setDoc(
                doc(db, "users", res.user.uid), {
                    username,
                    avatar: imgUrl,
                    email,
                    id : res.user.uid,
                    blocked:[],
                    friends: []
                }
            )

            await setDoc(
                doc(db, "userchats", res.user.uid), {
                    chats:[],
                }
            )

            toast.success("Account created! Logging in...")

            props.fetchUserInfo(res.user.uid);
        }
        catch (err)
        {
            toast.error(err.message);
        }
    }

    return <div className = "login">
        <div className='loginf'>
            <h2> Welcome back </h2>
            <form onSubmit={handleNormalLogin}>
                <input type = "text" placeholder='Email' name = "email"/>
                <input type = "password" placeholder='Password' name = "password"/>
                <button>Sign In</button>
                <button type = "button" className = "specialButton" onClick={signInWithGoogle}>Sign in With Google Account</button>
            </form>
        </div>
        <div className='separator'>
        </div>
        <div className='item'>
            <h2> Create an account </h2>
            <form onSubmit={handleRegister}>
                <label htmlFor='file'>
                <img src = {avatar.url || "./png/user.png"} alt=""/>
                    Upload an image</label>
                <input type = "file" id="file" accept=".jpg,.jpeg,.png" style={{display:"none"}} onChange={handleAvatar}/>
                <input type = "text" placeholder='Username' name = "username"/>
                <input type = "text" placeholder='Email' name = "email"/>
                <input type = "password" placeholder='Password' name = "password"/>
                <button>Register</button>
            </form>
        </div>
    </div>
}

export const Login = () => {
    const {currentUser, isLoading, fetchUserInfo, resetUserInfo} = useUserStore();

    useEffect( ()=>{
        console.warn('I RUN AGAIN!');

        const unSub = onAuthStateChanged(auth, (user)=> {
            if (!user)
            {
                resetUserInfo();

                unSub();    
                return;
            }
            
            fetchUserInfo(user.uid);
            unSub();
        });

        return () => unSub();
    }, [fetchUserInfo, resetUserInfo]);
    
    if (isLoading) return <div>TEST LOADING</div>;
  
    return (
        (!currentUser? <div className = "container">
        <Auth fetchUserInfo={fetchUserInfo}/>
        <Notification/>
        </div> : <Navigate to="/home" replace={true}/>
        )
    );
}