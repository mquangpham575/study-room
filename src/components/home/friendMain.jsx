import { collection, doc, getDocs, query, limit, where, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from '../dblibs/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import './friendMain.css';
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../dblibs/userStore';
import { toast } from 'react-toastify';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useKeyStore } from '../dblibs/privateKeyStore';

export const FriendMain = () => {
    const { savedPassword } = useKeyStore();
    const buttonNames = [
        'Friends',
        'Friend Requests',
        'Find Friends',
        'Blocked',
    ];

    const [usersList, setUsersList] = useState([]);
    const [activeSection, setActiveSection] = useState(buttonNames[0]);
    const {currentUser, rawFetch} = useUserStore();
    
    const handleQueryUser = async (filterText) => {
        try {
            console.log(filterText);

            switch (activeSection)
            {
                case 'Find Friends': {
                    let usersRef = null;

                    if (filterText)
                    {
                        usersRef = query(
                            collection(db, 'users'),
                            where('id', '!=', currentUser.id),
                            where('username', '>=', filterText),
                            where('username', '<=', filterText+'\uf7ff'),
                            limit(20));
                    } else {
                        usersRef = query(
                            collection(db, 'users'),
                            where('id', '!=', currentUser.id),
                            limit(20));
                    }
                    
                    const snapshot = await getDocs(usersRef);
                    
                    const usersData = snapshot.docs
                        .map(doc => {
                            const data = doc.data();                                
                            return data;
                        })
                        .filter(x=> !currentUser.friends.includes(x.id)
                        && !currentUser.pendingFR.includes(x.id)
                        && !x.friends.includes(currentUser.id)
                        && !currentUser.blocked.includes(x.id)
                    );

                    setUsersList(usersData);
                    break;
                }
                case 'Friend Requests': {
                    if (currentUser.pendingFR.length === 0)
                        {setUsersList([]); return;}
                    
                    let usersRef = null;

                    if (filterText)
                    {
                        usersRef = query(
                            collection(db, 'users'),
                            where('id', 'in', currentUser.pendingFR),
                            where('username', '>=', filterText),
                            where('username', '<=', filterText+'\uf7ff'),
                            limit(20));
                    } else {
                        usersRef = query(
                            collection(db, 'users'),
                            where('id', 'in', currentUser.pendingFR),
                            limit(20));
                    }

                    const snapshot = await getDocs(usersRef);
                    
                    const usersData = snapshot.docs
                        .map(doc => {
                            const data = doc.data();                                
                            return data;
                        });

                        setUsersList(usersData);
                    break;
                }
                case 'Friends': {
                    
                    if (currentUser.friends.length === 0)
                        {setUsersList([]); return;}

                    let usersRef = null;

                    if (filterText)
                    {
                        usersRef = query(
                            collection(db, 'users'),
                            where('id', 'in', currentUser.friends),
                            where('username', '>=', filterText),
                            where('username', '<=', filterText+'\uf7ff'),
                            limit(20));
                    } else {
                        usersRef = query(
                            collection(db, 'users'),
                            where('id', 'in', currentUser.friends),
                            limit(20));
                    }
        
                    const snapshot = await getDocs(usersRef);

                    const usersData = snapshot.docs
                        .map(doc => {
                            const data = doc.data();
                            return data;
                        });
                    
                    console.log(usersData);

                    setUsersList(usersData);
                    break;
                }
                case 'Blocked': {
                    if (currentUser.blocked.length === 0)
                        {setUsersList([]); return;}

                    let usersRef = null;

                    if (filterText)
                    {
                        usersRef = query(
                            collection(db, 'users'),
                            where('id', 'in', currentUser.blocked),
                            where('username', '>=', filterText),
                            where('username', '<=', filterText+'\uf7ff'),
                            limit(20));
                    } else {
                        usersRef = query(
                            collection(db, 'users'),
                            where('id', 'in', currentUser.blocked),
                            limit(20));
                    }

                    const snapshot = await getDocs(usersRef);

                    const usersData = snapshot.docs
                        .map(doc => {
                            const data = doc.data();                                
                            return data;
                        });
                    
                    console.log(usersData);

                    setUsersList(usersData);
                    break;
                }
            }
        } catch (error) {
            console.error("Error getting documents: ", error);
        }
    };

    useEffect(()=>{
        const unsub = onSnapshot(doc(db, "users", currentUser.id), (doc) => {
            console.log(doc.data());
            rawFetch(doc.data());
        });
        
        return()=>unsub();
    },[rawFetch])

    useEffect(() => {
        handleQueryUser();
    }, [activeSection, currentUser]);

    const searchResult = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const {searchText} = Object.fromEntries(formData);

        handleQueryUser(searchText);
    }

    const sendRequestAddFriend = async (userB) => {
        if (!currentUser || !userB || !userB.id) {
            console.log("Invalid users or missing userB ID");
            return;
        }

        try {
            console.log(userB);
            if (userB.pendingFR.includes(currentUser.id))
            {
                const userBRef = doc(db, "users", userB.id);
                await updateDoc(userBRef, {
                    pendingFR: arrayRemove(currentUser.id)
                });
                
                setUsersList(prevUsersList => {
                    return prevUsersList.map(user => {
                        if (user.id === userB.id) {
                             
                            return { ...user,
                                pendingFR: user.pendingFR.filter(x=>x !== currentUser.id)
                             };
                        }
                        return user;
                    });
                });
                
                toast.success('Removed request successfully!');
            } else {
                const userBRef = doc(db, "users", userB.id);
                await updateDoc(userBRef, {
                    pendingFR: arrayUnion(currentUser.id)
                });
                
                setUsersList(prevUsersList => {
                    return prevUsersList.map(user => {
                        if (user.id === userB.id) {
                            if (!user.pendingFR.includes(currentUser.id))
                                user.pendingFR.push(currentUser.id);
                            return user;
                        }
                        return user;
                    });
                });

                toast.success('Given request successfully!');    
            }
        } catch (e) {
            toast.error('Error: '+ e.message);
        }
    };

    const sendRequestBlock = async (userB) => {
        const blockUser = httpsCallable(getFunctions() , 'blockUser')

        try {
            const data = {blockid: userB.id};
            const res= await blockUser(data);

            toast.success('Successfully blocked user!');
        } catch(err)
        {
            console.log(err);
        }
    //     try {
    //         const userARef = doc(db, "users", currentUser.id);
    //         const userBRef = doc(db, "users", userB.id);

    //         await Promise.all([
    //             updateDoc(userARef, {
    //                 blocked: arrayUnion(userB.id),
    //                 friends: arrayRemove(userB.id),
    //                 pendingFR: arrayRemove(userB.id)
    //             }),
    //             updateDoc(userBRef, {
    //                 friends: arrayRemove(currentUser.id),
    //                 pendingFR: arrayRemove(currentUser.id)
    //              }),
    //         ]);

    //         setUsersList(prevList => prevList.filter(user => user.id !== userB.id));
    //         currentUser.pendingFR = currentUser.pendingFR.filter(x=>x !== userB.id);
    //         currentUser.friends = currentUser.friends.filter(x=>x !== userB.id);
    //         toast.success('Successfully blocked user!')
    // } catch (error) {
    //         toast.error("Error: " + error.message)
    //     }
    };

    const acceptFriend = async (userB) => {

        const acceptFRFunc = httpsCallable(getFunctions() , 'acceptFR')

        try {
            const data = {frid: userB.id, password: savedPassword};
            const res= await acceptFRFunc(data);

            toast.success('Successfully added friend!');
        } catch(err)
        {
            console.log(err);
        }
    };

    const unFriend = async (userB) => {
        if (!userB || !userB.id) {
            console.error("Invalid userB: Cannot unfriend.");
            return;
        }

        const unfriend = httpsCallable(getFunctions() , 'unfriend')

        try {
            const data = {frid: userB.id};
            const res= await unfriend(data);

            toast.success('Successfully removed friend!');
        } catch(err)
        {
            console.log(err);
        }

        // try {
        //     const userARef = doc(db, "users", currentUser.id);
        //     const userBRef = doc(db, "users", userB.id);

        //     await Promise.all([
        //         updateDoc(userARef, {
        //             friends: arrayRemove(userB.id),
        //         }),
        //         updateDoc(userBRef, {
        //             friends: arrayRemove(currentUser.id),
        //          }),
        //     ]);

        //     setUsersList(prevList => prevList.filter(user => user.id !== userB.id));
        //     currentUser.friends = currentUser.friends.filter(x=>x !== userB.id);
        //     toast.success('Successfully removed friend!')
        // } catch(error) {
        //     toast.error("Error: " + error.message)
        // }
    };

    const unBlock = async (userB) => {
        if (!userB || !userB.id) {
            console.error("Invalid user: Cannot unfriend.");
            return;
        }
        try {
            const userARef = doc(db, "users", currentUser.id);

            await updateDoc(userARef, {
                blocked: arrayRemove(userB.id),
            });

            setUsersList(prevList => prevList.filter(user => user.id !== userB.id));
            currentUser.blocked = currentUser.blocked.filter(x=>x !== userB.id);
            toast.success('Successfully unblocked!')
        } catch(error) {
            toast.error("Error: " + error.message)
        }
    };

    // Button click handler to set the active section
    const handleButtonClick = (sectionName) => {
        setActiveSection(sectionName);
    };

    return (
        <div className='friend'>
            <div className='search-bar'>
                <h3>Relations</h3>

                <form onSubmit={searchResult}>
                    <input type='text' placeholder='Search' name='searchText'/>
                </form>

            </div>

            <div className="option-button">
                {buttonNames.map((name) => (
                    <button
                        key={name}
                        onClick={() => handleButtonClick(name)}
                        className={activeSection === name ? 'active' : null}>
                        {name}
                    </button>
                ))}
            </div>

            <div className="content-section">
                {activeSection === 'Friends' && (
                    <div className="scroll-container">

                        <ul>
                            {usersList.map(user => (
                                <li key={user.id} className='user-item'>
                                    <img src={user.avatar} alt={user.username} className="user-avatar" />
                                    <span>{user.username}</span>
                                    <button onClick={() => unFriend(user)}>Unfriend</button>

                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeSection === 'Friend Requests' && (
                    <div className="scroll-container">

                        <ul>
                            {usersList.map(user => (

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
                            {usersList.map(user => (
                                <li key={user.id} className='user-item'>
                                    <img src={user.avatar} alt={user.username} className="user-avatar" />
                                    <span>{user.username}</span>
                                    <button onClick={() => sendRequestAddFriend(user)}>{user.pendingFR.includes(currentUser.id) ? 'Cancel' : 'Add friend'}</button>
                                    <button onClick={() => sendRequestBlock(user)}>Block</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeSection === 'Blocked' && (
                    <div className="scroll-container">
                        <ul>
                            {usersList.map(user => (
                                <li key={user.id} className='user-item'>
                                    <img src={user.avatar} alt={user.username} className="user-avatar" />
                                    <span>{user.username}</span>
                                    <button onClick={() => unBlock(user)}>Unblock</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
