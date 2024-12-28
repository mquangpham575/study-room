import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../dblibs/firebase-config';
import './taskMain.css';
import { useUserStore } from '../dblibs/userStore';
import { toast } from 'react-toastify';

export const TaskMain = () => {
    const {currentUser, fetchMoreInfo} = useUserStore();
    const [tasks, setTasks] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const tasksCollection = collection(db, 'tasks');
    const docRef = doc(db, 'tasks', currentUser.id);

    const handleDeleteTask = async (task, index) => {
        try {
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists()) {
                await updateDoc(docRef, {
                    tasks: arrayRemove(task)
                })
            }

            fetchMoreInfo(currentUser.id, 'tasks');
            setTasks(tasks.filter((i, ind)=>ind !== index));

            toast.success('Successfully removed task!');
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };
    
    const handleAddTask = async () => {
        if (taskName.trim() === '') {
            alert('Task name cannot be empty');
            return;
        }
        if (subtasks.length === 0) {
            alert('You must add at least one subtask');
            return;
        }
        if (subtasks.some((subtask) => subtask.name.trim() === '')) {
            alert('All subtasks must have a name');
            return;
        }

        const newTask = {
            name: taskName,
            subtasks: subtasks.map((subtask) => ({ ...subtask, completed: false })),
        };
        try {
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists()) {
                await updateDoc(docRef, {
                    tasks: arrayUnion(newTask)
                })
            } else {
                await setDoc(docRef, {
                    tasks: [newTask]
                })
            };

            resetPopup();
            
            setShowPopup(false);
            setTasks([...tasks, newTask]);
            fetchMoreInfo(currentUser.id, 'tasks');

            toast.success('Successfully added task!');
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleAddSubtask = () => {
        if (subtasks.some((subtask) => subtask.name.trim() === '')) {
            alert('Please complete all subtask names before adding a new one.');
            return;
        }

        setSubtasks([...subtasks, { name: '', completed: false }]);
    };

    const handleSubtaskNameChange = (id, value) => {
        setSubtasks(
            subtasks.map((subtask, i) =>
                i === id ? { ...subtask, name: value } : subtask
            )
        );
    };

    const handleDeleteSubtask = async (taskId, subtaskId) => {
        const task = tasks[taskId];
        if (!task) return;

        const updatedTasks = tasks.concat();
        const updatedSubtasks = updatedTasks[taskId].subtasks.filter((_, i) => i !== subtaskId);
        updatedTasks[taskId].subtasks = updatedSubtasks;
        
        try {
            if (updatedSubtasks.length === 0) {
                handleDeleteTask(tasks[taskId], taskId);
            } else {
                setTasks(updatedTasks);

                await updateDoc(doc(db, 'tasks', currentUser.id), {
                    tasks: updatedTasks
                });

                fetchMoreInfo(currentUser.id, 'tasks');
            }
        } catch (error) {
            console.error('Error deleting subtask:', error);
        }
    };

    const toggleSubtaskCompletion = async (taskId, subtaskId) => {
        const task = tasks[taskId];
        if (!task) return;

        const updatedTasks = tasks.concat();
        const updatedSubtasks = updatedTasks[taskId].subtasks[subtaskId];
        updatedSubtasks.completed = !updatedSubtasks.completed;
        try {
            setTasks(updatedTasks);

            await updateDoc(doc(db, 'tasks', currentUser.id), {
                tasks: updatedTasks
            });

            fetchMoreInfo(currentUser.id, 'tasks');
        } catch (error) {
            console.error('Error deleting subtask:', error);
        }
    };

    const resetPopup = () => {
        setTaskName('');
        setSubtasks([]);
    };

    useEffect(() => {
        if (!currentUser.tasks)
            fetchMoreInfo(currentUser.id, 'tasks');
        
    }, [currentUser, fetchMoreInfo]);

    useEffect(()=>{
        if (currentUser.tasks)
        {
            try {
                const fetchedData = [];
                const dat = currentUser.tasks;
                
                for (let a in dat.tasks) {
                    fetchedData.push(dat.tasks[a]);
                }

                setTasks(fetchedData);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        }
    }, [currentUser])

    return (
        <div className="task-main">
            <h1>Task Manager</h1>
            <button className="add-new-task-button" onClick={() => setShowPopup(true)}>
                Add New Task
            </button>

            <div className="task-list">
                {tasks.map((task, index) => {
                    const completedSubtasks = task.subtasks.filter(
                        (subtask) => subtask.completed
                    ).length;
                    const totalSubtasks = task.subtasks.length;
                    const progress = totalSubtasks
                        ? Math.round((completedSubtasks / totalSubtasks) * 100)
                        : 0;

                    return (
                        <div key={task.id} className="task-item">
                            <button
                                className="delete-task"
                                onClick={() => handleDeleteTask(task, index)}>
                                ✕
                            </button>
                            <h3>{task.name}</h3>
                            <div className="progress-bar">
                                <div className="progress" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p>{progress}% completed</p>
                            <div>
                                {task.subtasks.map((subtask, subindex) => (
                                    <li key={subtask.id} className="subtask-item">
                                        <input
                                            type="checkbox"
                                            checked={subtask.completed}
                                            onChange={() => toggleSubtaskCompletion(index, subindex)}
                                        />
                                        <span className="subtask-name">{subtask.name}</span>
                                        <button
                                            className="delete-subtask"
                                            onClick={() => handleDeleteSubtask(index, subindex)}>
                                            🗑️
                                        </button>
                                    </li>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {showPopup && (
                <div className="popup-task">
                    <div className="popup-task-content">
                        <h2>Create New Task</h2>
                        <input
                            type="text"
                            placeholder="Task Name"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                        />
                        <div className="subtasks">
                            <h2>Subtasks</h2>
                            {subtasks.map((subtask, subid) => (
                                <div key={subtask.id} className="subtask-item">
                                    <input
                                        type="text"
                                        placeholder="Subtask Name"
                                        value={subtask.name}
                                        onChange={(e) =>
                                            handleSubtaskNameChange(subid, e.target.value)
                                        }
                                    />
                                </div>
                            ))}
                            <button onClick={handleAddSubtask}>+ Add Subtask</button>
                        </div>

                        <div className="action-buttons">
                            <button className="save-btn" onClick={handleAddTask}>Save Task</button>
                            <button
                                className="cancel-btn"
                                onClick={() => {
                                    resetPopup();
                                    setShowPopup(false);
                                }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
