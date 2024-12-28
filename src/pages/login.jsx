import {Notification} from '../components/notification/notification.jsx';
import './login.css';

import { toast } from 'react-toastify';
import {auth, provider, db} from '../components/dblibs/firebase-config.js';
import { uploadImage } from '../components/dblibs/uploadImage.js';
import {onAuthStateChanged} from 'firebase/auth';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword } from 'firebase/auth';
import {collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where} from 'firebase/firestore';

import {useEffect, useState} from 'react';
import { useUserStore } from '../components/dblibs/userStore.js';
import {
    Navigate,
  } from "react-router-dom";

import { useKeyStore } from '../components/dblibs/privateKeyStore.js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import crypto from 'crypto';
import { decrypt, encrypt, handleDecryptKey } from '../components/dblibs/pubprivKeys.js';

export const Auth = (props) => {
    const [avatar, setAvatar] = useState({
        file:null,
        url:""
    });
    const [loading, setLoading] = useState(true);

    const handleAvatar = e => {
        if (e.target.files[0])
            setAvatar({
                file:e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
    }

    const handleNormalLogin = async(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const {email, password} = Object.fromEntries(formData);

        signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            const en_privKey = userDoc.data().encryptedPrivateKey;
            const privateKey = handleDecryptKey(en_privKey,
                userDoc.data().iv,
                password
            )

            props.fetchUserInfo(user.uid);
            props.setKey(user.uid, {
                publicKey: userDoc.data().publicKey,
                privateKey,
            });
            
            console.log("Retrieved private key:", privateKey);
            toast.success("Success! Logging in...");
          })
          .catch((err) => {
            toast.error(err.message);
          });
    }

    const handleRegister = async(e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const {username, email, password} = Object.fromEntries(formData);
        let imgUrl = "https://firebasestorage.googleapis.com/v0/b/testyappayappadoo.firebasestorage.app/o/avatars%2Fundeadbasketballplayer.png?alt=media&token=d49e2bf4-ddfe-4393-8e2f-0b6876754876";
        
        createUserWithEmailAndPassword(auth, email, password)
        .then(async (res)=>{
            const makeKeyPairs = httpsCallable(getFunctions() , 'makeKeyPairs')
            try {
                console.log(auth.currentUser);

                const data = {password};
                const resi= await makeKeyPairs(data);
                // console.log('everythign done', resi.data.encryptedPrivateKey);

                let d_cipher = handleDecryptKey(resi.data.encryptedPrivateKey,
                    resi.data.iv,
                    password
                )

                console.log('everythign done 2\n', d_cipher);

                const encrypted = encrypt('This is a test', resi.data.publicKey);
                console.log("Encrypted: ", encrypted);
              
                const decrypted = decrypt(encrypted, d_cipher);
                console.log('Decrypted: ', decrypted);

                await setDoc(
                    doc(db, "users", res.user.uid), {
                        username,
                        avatar: imgUrl,
                        email,
                        id : res.user.uid,
                        blocked:[],
                        friends:[],
                        pendingFR:[],
                    }, {merge: true}
                )
    
                await setDoc(
                    doc(db, "userchats", res.user.uid), {
                        chats:[],
                        roomIds: [],
                    }, {merge: true}
                );

                props.setKey(res.user.uid, {
                    publicKey: resi.data.publicKey,
                    privateKey: d_cipher
                });

                toast.success("Account created! Logging in...");
                props.fetchUserInfo(res.user.uid);    
            } catch(err)
            {
                console.log(err);
            }
        })
        .catch((err)=>{
            toast.error(err.message);
        });
        

        // if (avatar.file)
        //     imgUrl = await uploadImage(avatar.file);

        // await setDoc(
        //     doc(db, "users", res.user.uid), {
        //         username,
        //         avatar: imgUrl,
        //         email,
        //         id : res.user.uid,
        //         blocked:[],
        //         friends:[],
        //         pendingFR:[],
        //     }
        // )

        // await setDoc(
        //     doc(db, "userchats", res.user.uid), {
        //         chats:[],
        //         roomIds: [],
        //     }
        // )


        //props.fetchUserInfo(res.user.uid);
    }

    return <div className = "login">
        <div className='loginf'>
            <h2> Welcome back </h2>
            <form onSubmit={handleNormalLogin}>
                <input type = "text" placeholder='Email' name = "email"/>
                <input type = "password" placeholder='Password' name = "password"/>
                <button>Sign In</button>
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
    const {id, keys, setKey, resetKey} = useKeyStore();

    useEffect( ()=>{
        const unSub = onAuthStateChanged(auth, (user)=> {
            console.log(auth.currentUser);
            if (!user)
            {
            resetUserInfo();
            resetKey();
            return;
            }

            if (id !== null && user.uid !== id)
            {
                console.warn("I Did logged out btw");
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

    console.log(currentUser);

    if (isLoading) return <div>TEST LOADING</div>;

    console.log("Final: ", id, ' - keys: ', keys);


    return (
        (!currentUser? <div className = "container">
        <Auth fetchUserInfo={fetchUserInfo} setKey = {setKey}/>
        <Notification/>
        </div> : <Navigate to="/home" replace={true}/>
        )
    );
}