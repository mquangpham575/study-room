import { collection, doc, getDocs, limit, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import './roomCreateMain.css';
import React, {useState} from 'react';
import { db } from '../dblibs/firebase-config';
import { toast } from 'react-toastify';
import { useUserStore } from '../dblibs/userStore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useKeyStore } from '../dblibs/privateKeyStore';
import crypto from 'crypto';

export const RoomCreateMain = () => {
    const {currentUser} = useUserStore();
    const {roomKeys, setRoomKey} = useKeyStore();
    const createRoom = async e => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const obj = Object.fromEntries(formData);

        try {
            const response = await httpsCallable(getFunctions(), 'makeChatroom')({
                private: obj.private,
                limit: obj.roomlimit,
                password: obj.password,
                name: obj.name,
            });
            
            if (!roomKeys[response.data.id])
                setRoomKey(
                  response.data.id,
                  crypto.createHash('sha256').update(obj.password).digest('hex'));
        
            toast.success("Made room successfully!");
        } catch(err)
        {
            toast.error('Error: '+err.message);
        }
    }

    return (
        <div className = 'create_ui'> 
            <div className = 'create_label'>
                <p> Create Room </p>
            </div>

            <form onSubmit={createRoom} className = 'create_form'>
                
                <div>
                    <p> Name: </p>
                    <input type = "text" placeholder='Name' name = "name"/>
                </div>

                <div>
                    <p> Password: </p>
                    <input type = "password" placeholder='Password' name = "password"/>
                </div>

                <div>
                    <p> Room Limit: </p>
                    <input type = "number"
                    min="1"
                    max="20"
                    placeholder='10 (maximum 20)'
                    name = "roomlimit"/>
                </div>

                <div className = "form_sep"/>

                <label class="form_check">
                    <input type="checkbox" name = "private"/>
                    <span class="checkmark"> </span>
                    <span> Private </span>
                </label>

                <div className = "form_sep"/>

                <div className='form_submitButton'>
                    <button> Create </button>
                </div>
            </form>
        </div>
    )
}