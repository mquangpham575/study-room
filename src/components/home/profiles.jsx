import { useUserStore } from '../dblibs/userStore';
import { useLocation, useNavigate } from 'react-router-dom';

import './profiles.css';

export const Profiles = () => {
    const {currentUser} = useUserStore();
    let navigate = useNavigate();
    let location = useLocation();

    const redirectToPage = (str) => {
        if (location.pathname !== str)
            navigate(str);
    }

    return (
        <div className='profiles'>
                <div className = 'profiles_avatarGradient'>
                    <button
                        onClick={() => redirectToPage("/profile/" + currentUser.id)}>
                        {currentUser.avatar?
                            <img className = "forceNoInvert" src = {currentUser.avatar} alt=""/>:
                            <img src = {"../png/user.png"} alt=""/> }
                    </button>
                </div>

                <button className = 'buttonTab'
                    onClick={() => redirectToPage("/home")}>
                    <img src = {"../png/home.png"} alt=""/>
                    <p> Home </p>
                </button>

                <button className = 'buttonTab'
                    onClick={() => redirectToPage("/create")}>
                    <img src = {"../png/add.png"} alt=""/>
                    <p> Create </p>
                </button>

                <button className = 'buttonTab'
                    onClick={() => redirectToPage("/chat")}>
                    <img src = {"../png/chat.png"} alt=""/>
                    <p> Secure Chat </p>
                </button>

                <div className = 'sep'/>

                <button className = 'buttonTab'
                    onClick={() => redirectToPage("/schedule/" + currentUser.id)}>
                    <img src = {"../png/schedule.png"} alt=""/>
                    <p> Schedules </p>
                </button>

                <button className = 'buttonTab'
                    onClick={() => redirectToPage("/task")}>
                    <img src = {"../png/clipboard.png"} alt=""/>
                    <p> Tasks </p>
                </button>

                <button className = 'buttonTab'
                    onClick={() => redirectToPage("/quiz")}>
                    <img src = {"../png/choose.png"} alt=""/>
                    <p> Quizs </p>
                </button>

                <div className = 'sep'/>

                <button className = 'buttonTab'
                    onClick={() => redirectToPage("/friend")} >
                    <img src = {"../png/contact-book.png"} alt=""/>
                    <p> Relations </p>
                </button>
        </div>
    )
}