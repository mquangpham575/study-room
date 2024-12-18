import './roomCreateMain.css';
import React, {useState} from 'react';

export const RoomCreateMain = () => {
    const [avatar, setAvatar] = useState({
        file:null,
        url:""
    });

    console.log(avatar?.url);

    const handleAvatar = e => {
        if (e.target.files[0])
            setAvatar({
                file:e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
    }

    const createRoom = async e => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const obj = Object.fromEntries(formData);

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
                    <input type = "text" placeholder='10 (maximum 20)' name = "roomlimit"/>
                </div>

                <div className = "form_sep"/>

                <label class="form_check">
                    <input type="checkbox" name = "private"/>
                    <span class="checkmark"> </span>
                    <span> Private </span>
                </label>

                <div className = "form_sep"/>

                <label htmlFor='file' className = 'form_bgDisplay'>
                    <img src = {avatar?.url || "./png/bg2.jpg"}/>
                    <span> Upload background image </span>
                </label>

                <input
                    onChange = {handleAvatar}
                    type = "file" id="file" accept=".jpg,.jpeg,.png"
                    style={{display:"none"}}/>

                <div className='form_submitButton'>
                    <button> Create </button>
                </div>
            </form>
        </div>
    )
}