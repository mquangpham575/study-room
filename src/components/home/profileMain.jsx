import './profileMain.css';
import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import { useUserStore } from '../dblibs/userStore';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../dblibs/firebase-config';
import { toast } from 'react-toastify';
import { usePreviewStore } from '../dblibs/previewUserStore';

export const ProfileMain = () => {
    const {previewUser, isLoading, curUserProf,
        fetchPrUserInfo , fetchProfile, resetUserInfoForLoading} = usePreviewStore();
    const {currentUser, fetchUserInfo} = useUserStore();

    const [editName, setEditName] = useState(false);
    const [editAM, setEditAM] = useState(false);
    const [dropdown, setDropdown] = useState(null);

    let id = useParams().id;
        
    console.log('beginning',previewUser, isLoading, curUserProf);

    useEffect(()=>{
        resetUserInfoForLoading();
        
        fetchProfile(id);

        console.log(previewUser, isLoading, curUserProf);

        fetchPrUserInfo(id);

        console.log('I ran');
        console.log(previewUser, isLoading);
        },[id]);
    
    if (isLoading) return <div style = {{
            'font-size': '45px',
            'display': 'flex',
            'align-items': 'center',
            'height': '100%',
            'font-weight': 'bold',
            'text-shadow': '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
        }}>LOADING...</div>;
            
    if (previewUser == null) return <div style = {{
        'font-size': '45px',
        'display': 'flex',
        'align-items': 'center',
        'height': '100%',
        'font-weight': 'bold',
        'text-shadow': '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
    }}>NO SUCH USER EXISTS.</div>;

    const renderOverlay = (e) => {
        const chatArena = e.currentTarget.parentElement.parentElement;

        setDropdown(
            <div style = {{
                position: 'absolute',
                top: e.currentTarget.offsetTop + 35 - chatArena.scrollTop,
                left: e.currentTarget.offsetLeft - 75,
                'z-index': 2,
                'background-color': 'green',
            }}>        
                <div className={"dropdown-content"}>
                    <button> Unfriend </button>
                    <button> Block </button>
                </div>
            </div>
        );
    }

    const handleEditName = async (e) => {
        e.preventDefault();
        if (currentUser.id === previewUser.id) return;
        
        const formData = new FormData(e.target);
        const newname = formData.get("newname");
        const docRef = doc(db, "users", id);

        toast.info("Updating your new name...");
        
        setEditName(false);

        try {
            await updateDoc(docRef, {
                username: newname
              });

            toast.success("Name updated!");

            fetchUserInfo(currentUser.id);
        } catch {
            toast.error("Something went wrong! Please try again");
        }
    }

    const handleEditAM = async (e) => {
        e.preventDefault();
        if (currentUser.id === previewUser.id) return;
        
        const formData = new FormData(e.target);
        const aboutme = formData.get("aboutme");
        const docRef = doc(db, "profile", id);

        toast.info("Updating your About Me...");
        
        setEditAM(false);

        try {
            const docSnap = await getDoc(docRef);

            if (docSnap.exists())
                await updateDoc(docRef, {
                    profileText: aboutme
                });
            else
                await setDoc(docRef, {
                    profileText: aboutme
                });

            toast.success("Your 'About Me' is updated!");

            fetchProfile(currentUser.id);
        } catch {
            toast.error("Something went wrong! Please try again");
        }
    }

    // <div className = 'display_online'>
    //     <div className = 'display_circle'/>
    //     <p className = 'display_state On'> {currentUser?.status || "Ambiguous"} </p>
    // </div>

    return (
        <div className = 'profile_ui'> 
            <div className = 'profile_nameArea'>
                <div className = 'nameArea_displayName'>
                    <img className = 'profile_avt' src = {previewUser.avatar || "../png/user.png"} alt=""/>
                    {(() => {
                        if (editName)
                            return(
                                <form className = 'profile_name_edit' onSubmit={handleEditName}>
                                    <input type = "text" placeholder='New name' name = "newname"/>
                                </form>
                            )
                        
                        return(<p className = 'profile_name' > {previewUser?.username || 'Default'} </p>)
                    })()}

                    {currentUser.id === previewUser.id && <button onClick={
                        ()=>{
                            setEditName(!editName);
                        }
                    }>
                        <img className = 'profile_changeName' src = {"../png/edit.png"} alt=""/>
                    </button>}
                </div>

                <div className = 'nameArea_displayStats'>                    
                    {previewUser.id != currentUser.id && <button className = 'display_opts'
                        onClick = {e=>{
                            if (dropdown == null)
                                renderOverlay(e);
                            else
                                setDropdown(null);
                        }}>
                        <img src = {"../png/more.png"} alt=""/>
                    </button>}
                    
                    {dropdown}

                    <div className = 'display_stats'>
                        <div className = 'display_stat'>
                            <span> Friends </span>
                            <p> {previewUser?.friends?.length || 0} </p>
                        </div>

                        <div className = 'display_stat'>
                            <span> Rooms </span>
                            <p> {previewUser?.rooms?.length || 0} </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className = 'profile_aboutMe'>
                <div style = {{
                    display: 'flex',
                    'justify-content': 'space-between',
                    'align-items': 'center'
                }}>
                    <p className = 'ABOUTME'> About Me </p>
                    {currentUser.id === previewUser.id && <button className = 'ABOUTME_edit'
                        onClick = {
                            () => {
                                setEditAM(!editAM);
                            }
                        }>
                        <img src = {"../png/edit.png"} alt=""/>
                    </button>}
                </div>
                
                {(() => {
                    if (editAM)
                        return(
                            <div style = {{all:'inherit'}}>
                                <form onSubmit={handleEditAM} id = "amForm">
                                    <input type="submit" style = {{cursor: 'pointer'}}/>
                                </form>

                                <textarea name = 'aboutme' form = 'amForm'>
                                    I thou ast as I maht!
                                </textarea>
                            </div>
                        )
                        
                    return(
                        <div className = 'AboutMe_container'>
                            {curUserProf || "Nothing"}
                        </div>
                    )
                })()}
            </div>
        </div>
    )
}