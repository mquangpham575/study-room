import { doc,
    onSnapshot,
    collection,
    query,
    where,
    getDocs, 
    getDoc,
    serverTimestamp,
    setDoc,
    arrayUnion,
    updateDoc} from 'firebase/firestore';

import { db } from '../dblibs/firebase-config.js';
import { useUserStore } from '../dblibs/userStore';
import './chatroomMain.css';
import React, { useEffect, useState } from 'react';
import { useIndChatStore } from '../dblibs/indChatStore.js';
import { uploadChatImage } from '../dblibs/uploadChatImg.js';

export const ChatroomMain = () => {
    const [dropdown, setDropdown] = useState(false);
    const chatData = [
        {
            content: {
                cont: "In contrast to other answers, I would prefer to inline the switch in the render function. It makes it more clear what components can be rendered at that position. You can implement a switch-like expression by using a plain old javascript object:",
                type: "text",
            },
            context: 'Self',
        },
        {
            content: {
                cont: "https://firebasestorage.googleapis.com/v0/b/testyappayappadoo.firebasestorage.app/o/chatimgs%2Fdvh75WYtLgMlFw5OryJL%2FThu%20Nov%2028%202024%2023%3A05%3A11%20GMT%2B0700%20(Indochina%20Time)undeadbasketballplayer.png?alt=media&token=4345f9aa-a226-4869-a7cc-4c156b6e69b8",
                type: "text",
            },
            context: null,
        },

        {
            content: {
                cont: "In contrast to other answers, I would prefer to inline the switch in the render function. It makes it more clear what components can be rendered at that position. You can implement a switch-like expression by using a plain old javascript object:",
                type: "text",
            },
            context: 'Self',
        },
        {
            content: {
                cont: "https://firebasestorage.googleapis.com/v0/b/testyappayappadoo.firebasestorage.app/o/chatimgs%2Fdvh75WYtLgMlFw5OryJL%2FThu%20Nov%2028%202024%2023%3A05%3A11%20GMT%2B0700%20(Indochina%20Time)undeadbasketballplayer.png?alt=media&token=4345f9aa-a226-4869-a7cc-4c156b6e69b8",
                type: "text",
            },
            context: null,
        },
        {
            content: {
                cont: "In contrast to other answers, I would prefer to inline the switch in the render function. It makes it more clear what components can be rendered at that position. You can implement a switch-like expression by using a plain old javascript object:",
                type: "text",
            },
            context: 'Self',
        },
        {
            content: {
                cont: "https://firebasestorage.googleapis.com/v0/b/testyappayappadoo.firebasestorage.app/o/chatimgs%2Fdvh75WYtLgMlFw5OryJL%2FThu%20Nov%2028%202024%2023%3A05%3A11%20GMT%2B0700%20(Indochina%20Time)undeadbasketballplayer.png?alt=media&token=4345f9aa-a226-4869-a7cc-4c156b6e69b8",
                type: "text",
            },
            context: null,
        },
        {
            content: {
                cont: "In contrast to other answers, I would prefer to inline the switch in the render function. It makes it more clear what components can be rendered at that position. You can implement a switch-like expression by using a plain old javascript object:",
                type: "text",
            },
            context: 'Self',
        },
        {
            content: {
                cont: "https://firebasestorage.googleapis.com/v0/b/testyappayappadoo.firebasestorage.app/o/chatimgs%2Fdvh75WYtLgMlFw5OryJL%2FThu%20Nov%2028%202024%2023%3A05%3A11%20GMT%2B0700%20(Indochina%20Time)undeadbasketballplayer.png?alt=media&token=4345f9aa-a226-4869-a7cc-4c156b6e69b8",
                type: "text",
            },
            context: null,
        },
        {
            content: {
                cont: "https://firebasestorage.googleapis.com/v0/b/testyappayappadoo.firebasestorage.app/o/chatimgs%2Fdvh75WYtLgMlFw5OryJL%2FThu%20Nov%2028%202024%2023%3A05%3A11%20GMT%2B0700%20(Indochina%20Time)undeadbasketballplayer.png?alt=media&token=4345f9aa-a226-4869-a7cc-4c156b6e69b8",
                type: "quiz",
            },
            context: 'Self',
        },

    ];

    const [pointedAt, setPointedAt] = useState(-1);

    const renderOverlay = (e) => {
        const chatArena = e.currentTarget.parentElement.parentElement;

        setDropdown(
            <div style = {{
                position: 'absolute',
                top: e.currentTarget.offsetTop + 25 - chatArena.scrollTop,
                left: e.currentTarget.offsetLeft,
                'z-index': 2,
                'background-color': 'green',
            }}>        
                <div className={"dropdown-content"}>
                    <button> Copy Text </button>
                    <button> Pin Message </button>
                    <button> Delete </button>
                </div>
            </div>
        );
    }
// <div className = 'chatComp Self'
//     onMouseEnter={e=>{
//         if (dropdown) return;

//         let img = e.currentTarget.querySelector('img');
//         img.style.visibility = 'visible';
//         img.style.cursor = 'pointer';
//     }}
//     onMouseLeave={e=>{
//         if (dropdown) return;

//         let img = e.currentTarget.querySelector('img');
//         img.style.visibility = 'hidden';
//         img.style.cursor = 'default';
//     }}

//     >
    
//     <div className='chat_TextBox Self'>                        
//         <div className ='chat_text'>
//             <p> CONTENT </p>
//         </div>
//     </div>
    
//     <div style = {
//         {
//             display: "absolute",
//             width: 0,
//             height: 0,
//             "margin-top": "25px",
//         }
//         }>
//         {dropdown && <div className="dropdown-content Self">
//             <button> Copy Text </button>
//             <button> Pin Message </button>
//             <button> Delete </button>
//         </div>}
//     </div>

//     <button
//         style = {{
//             'background-color' : 'transparent',
//             border: 'none',
//             'margin-left': '15px',
//             'margin-right': '15px',
            
//             }
//         }
    
//         onClick={e=>{
//             setDropdown(!dropdown);
//         }}>

//         <img className = 'more' src = "./png/more.png" alt=""/>
//     </button>
// </div>


    return (
        <div className='chatr_ui'>
            <div className='chat_navbar'>
                <div className='chat_info'>
                    <div>
                        <p> Room: Ad hominem </p>
                        <p> Members: 4/20 </p>
                    </div>
                </div>

                <div className='chat_search'>
                    <div>
                        <img src = {"./png/search.png"} alt=""/>
                        <input type = 'text' placeholder = 'Search'/>
                    </div>
                </div>

                <div className='chat_users'>
                    <button
                        className = 'chat_userDisplay'
                        >
                        <div>
                            <img src = "./png/user.png" alt=""/>
                        </div>
                        <div className='chat_userSep'> </div>
                        <div className='chat_userInf'>
                            <p> usrn ame 243</p>
                        </div>
                    </button>
                </div>

                <div className='chat_leave'>
                    <button>
                        Disband
                    </button>

                    <button>
                        Leave
                    </button>
                </div>
            </div>

            <div className='chat_bar'>
                <div className = 'chat_chatArena'>
                    {
                        chatData?.map((message, index) => {
                            let cont = '';

                            if (message.context != null)
                                cont = ' ' + message.context;

                            return (
                                <div className = {'chatComp' + cont}
                                    onMouseEnter={e=>setPointedAt(index)}
                                    onMouseLeave={e=>{
                                        if (pointedAt !== -1 && pointedAt === index)
                                        {
                                            setPointedAt(-1);
                                            setDropdown(false);
                                        }
                                    }}>
                                    
                                    {(()=>{
                                        if (message.content.type == 'quiz')
                                        {
                                            return  (
                                                <div className={'chat_QuizBox' + cont}>
                                                    <button>
                                                        Enter
                                                    </button>
                                                    <div className = 'chat_quizSep'> </div>
                                                    <div className = 'chat_quizInfo'>
                                                        <h2> Quiz Title </h2>
                                                        <span>* has invited you to do a quiz!</span>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        
                                        return (
                                            <div className={'chat_TextBox' + cont}>
                                                <div className ='chat_text'>
                                                    <p> {message.content.cont} </p>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                
                                    {index === pointedAt && <button
                                        style = {{
                                            'background-color' : 'transparent',
                                            border: 'none',
                                            'margin-left': '15px',
                                            'margin-right': '15px',
                                            width: '35px',
                                            height: '35px',
                                            display: 'flex',

                                            'justify-content': 'center',
                                            }
                                        }
                                
                                        onClick={e=>{
                                            if (dropdown != null)
                                                renderOverlay(e);
                                            else
                                                setDropdown(null);
                                        }}>
                                            
                                        <img className = 'more' src = "./png/more.png" alt=""/>
                                        
                                        {dropdown}
                                    </button>}
                                </div>
                            )
                        })
                    }
                </div>

                <form className = 'chat_chatBar'>
                    <label htmlFor='file'>
                        <img src = "./png/image.png" alt=""/>
                    </label>

                    <label htmlFor='file'>
                        <img src = "./png/schedule.png" alt=""/>
                    </label>

                    <label htmlFor='file'>
                        <img src = "./png/choose.png" alt=""/>
                    </label>

                    <input type = "file" id="file"
                        accept=".jpg,.jpeg,.png" style={{display:"none"}}
                        />
                    <input type = 'text' placeholder = 'Search' name='sendtext'/>
                    <input type = 'image' src = {"./png/send-message.png"} alt="">
                    </input>
                </form>
            </div>
        </div>
    )
}