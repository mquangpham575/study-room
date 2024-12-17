import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../dblibs/firebase-config'; // Importing the initialized Firestore instance
import { onAuthStateChanged } from 'firebase/auth';
import './friendMain.css';
import React, { useState, useEffect } from 'react';

export const FriendMain = () => {
    const buttonNames = [
        'Currently Online',
        'Friends',
        'Friends Request',
        'Find Friends'
    ];

    const [usersList, setUsersList] = useState([]); // State to hold the list of users
    const [requestFriendList, setRequestFriendList] = useState([]); // State to hold the list of users
    const [friendList, setFriendList] = useState([]);
    const [activeSection, setActiveSection] = useState(buttonNames[0]); // Track which button is clicked
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // State for search input

    const filterSearch = (items) => {
        return items.filter((item) =>
            item.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user); // Save in state for better access
            } else {
                console.error("No user is logged in.");
            }
        });
        return () => unsubscribe();
    }, []);

    const changeDataState = (variableState, user) => {
        variableState((prevFriendList) => {
            // Check if the user is already in the list
            const isUserExists = prevFriendList.some(friend => friend.id === user.id);
    
            if (isUserExists) {
                // If user already exists, return the list unchanged
                return prevFriendList;
            }
    
            // If user doesn't exist, add the user to the list
            return [...prevFriendList, user];
        });
    };
    

    // Handle querying all users
    const handleQueryUser = async () => {
        if (!currentUser) return;
        try {
            const loggedInUser = currentUser;
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);

            const requestIds = await handleQuerySubcollection(currentUser, 'requestFriend');
            const friendIds = await handleQuerySubcollection(currentUser, 'friend');

            const usersData = snapshot.docs
                .filter((doc) => doc.id !== loggedInUser.uid)
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        username: data.username,
                        avatar: data.avatar,
                        friend: false
                    };
                });

            setUsersList(usersData.filter(user => !requestIds.has(user.id)));
            setRequestFriendList(usersData.filter(user => requestIds.has(user.id)));
            setFriendList(usersData.filter(user => friendIds.has(user.id)));
        } catch (error) {
            console.error("Error getting documents: ", error);
        }
    };

    // Handle querying a subcollection
    const handleQuerySubcollection = async (user, subcollection) => {
        try {
            const userRef = collection(db, 'users', user.uid, subcollection);
            const snapshot = await getDocs(userRef);
            return new Set(snapshot.docs.map(doc => doc.id));
        } catch (error) {
            console.error(`Error fetching subcollection '${subcollection}':`, error);
            return new Set();
        }
    };

    useEffect(() => {
        handleQueryUser();
    }, [currentUser]);

    // Send friend request to another user
    const sendRequestAddFriend = async (userB) => {
        setUsersList(prevUsersList => {
            return prevUsersList.map(user => {
                if (user.id === userB.id) {
                    return { ...user, friend: !user.friend }; // Toggle the 'friend' status
                }
                return user;
            });
        });

        if (!currentUser || !userB || !userB.id) {
            console.log("Invalid users or missing userB ID");
            return;
        }

        try {
            const userBRef = doc(db, "users", userB.id, "requestFriend", currentUser.uid);
            const requestSnapshotUserB = await getDoc(userBRef);

            if (!requestSnapshotUserB.exists()) {
                await setDoc(userBRef, { id: currentUser.uid });
                setUsersList(prev => prev.map(user => user.id === userB.id ? { ...user, friend: true } : user));
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Accept friend request
    const acceptFriend = async (userB) => {
        try {
            const userARef = doc(db, "users", currentUser.uid, 'friend', userB.id); // 'friend' is a subcollection
            const userBRef = doc(db, "users", userB.id, 'friend', currentUser.uid);

            // Reference to the requestFriend subcollections to remove the request
            const requestRefA = doc(db, "users", currentUser.uid, 'requestFriend', userB.id);

            await Promise.all([
                setDoc(userARef, { id: userB.id, username: userB.username, avatar: userB.avatar }),
                setDoc(userBRef, { id: currentUser.uid, username: currentUser.displayName, avatar: currentUser.photoURL }),

                deleteDoc(requestRefA)
            ]);
            changeDataState(setFriendList, userB); // Update friend list state
            setRequestFriendList(prevList => prevList.filter(user => user.id !== userB.id));
            console.log(`Friendship established between ${currentUser.displayName} and ${userB.username}.`);
        } catch (error) {
            console.error("Error establishing mutual friendship: ", error);
        }
    };
    const unFriend = async (userB) => {
        if (!userB || !userB.id) {
            console.error("Invalid userB: Cannot unfriend.");
            return;
        }
        try {
            const userARef = doc(db, "users", currentUser.uid, 'friend', userB.id); 
            const userBRef = doc(db, "users", userB.id, 'friend', currentUser.uid);
            await Promise.all([
                deleteDoc(userARef),
                deleteDoc(userBRef)
            ]);
            setFriendList(prevList => prevList.filter(user => user.id !== userB.id));
        } catch(error) {
            console.error("Error while unfriending user:", error);
        }
    };

    // Button click handler to set the active section
    const handleButtonClick = (sectionName) => {
        setActiveSection(sectionName);
    };

    return (
        <div className='friend'>
            <div className='search-bar'>
                <h3>Friends</h3>
                <input onChange={(e) => setSearchTerm(e.target.value)} type='text' placeholder='Search friends' />
            </div>

            <div className="option-button">
                {buttonNames.map((name) => (
                    <button
                        key={name}
                        onClick={() => handleButtonClick(name)}
                        className={activeSection === name ? 'active' : ''}
                    >
                        {name}
                    </button>
                ))}
            </div>

            <div className="content-section">
                {activeSection === 'Currently Online' && <p>Displaying Currently Online Users</p>}

                {activeSection === 'Friends' && (
                    <div className="scroll-container">
                        <ul>
                            {filterSearch(friendList).map(user => (
                                <li key={user.id} className='user-item'>
                                    <img src={user.avatar} alt={user.username} className="user-avatar" />
                                    <span>{user.username}</span>
                                    <button onClick={() => unFriend(user)}>Unfriend</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeSection === 'Friends Request' && (
                    <div className="scroll-container">
                        <ul>
                            {filterSearch(requestFriendList).map(user => (
                                <li key={user.id} className='user-item'>
                                    <img src={user.avatar} alt={user.username} className="user-avatar" />
                                    <span>{user.username}</span>
                                    <button onClick={() => acceptFriend(user)}>Accept</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeSection === 'Find Friends' && (
                    <div className="scroll-container">
                        <ul>
                            {filterSearch(usersList).map(user => (
                                <li key={user.id} className='user-item'>
                                    <img src={user.avatar} alt={user.username} className="user-avatar" />
                                    <span>{user.username}</span>
                                    <button onClick={() => sendRequestAddFriend(user)}>{user.friend ? 'Cancel' : 'Add friend'}</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
