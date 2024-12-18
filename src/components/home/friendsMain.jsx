import './friendsMain.css';
import React, {useState} from 'react';

export const FriendsMain = () => {
    return (
        <div className = 'friends_ui'> 
            <div className = 'friends_label'>
                <p> Friends </p>
                
                <div className = 'friends_search'>
                    <img src = {"./png/search.png"} alt=""/>
                    <form>
                        <input type = 'text' placeholder = 'Search' name = 'name'/>
                    </form>
                </div>
            </div>

            <div className = 'friends_switch'>
                <button className = 'friends_tab On'> Friends </button>
                <button className = 'friends_tab'> Pending </button>
            </div>
            
            <div className = 'friends_display'>
                <div className = 'displayScrollable'>
                    
                    <button className = 'friends_friendBox'>
                        <img src = "./png/user.png" alt = ""/>
                        <div className='friendbox_sep'/>
                        <div className = 'friendbox_details'>
                            <p> Name </p>
                            <div className = 'details_opt'>
                                <button> Unfriend </button>
                            </div>
                        </div>
                    </button>

                    <button className = 'friends_friendBox'>
                        <img src = "./png/user.png" alt = ""/>
                        <div className='friendbox_sep'/>
                        <div className = 'friendbox_details'>
                            <p> Name </p>
                            <div className = 'details_opt'>
                                <button> Accept </button>
                                <button> Decline </button>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}