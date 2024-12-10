import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../dblibs/firebase-config';
import './taskMain.css';

export const TaskMain = () => {
    const [tasks, setTasks] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const tasksCollection = collection(db, 'tasks');

    const fetchTasks = useCallback(async () => {
        try {
            const data = await getDocs(tasksCollection);
            setTasks(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }, [tasksCollection]);

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteDoc(doc(db, 'tasks', taskId));
            fetchTasks();
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
            await addDoc(tasksCollection, newTask);
            resetPopup();
            setShowPopup(false);
            fetchTasks();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleAddSubtask = () => {
        if (subtasks.some((subtask) => subtask.name.trim() === '')) {
            alert('Please complete all subtask names before adding a new one.');
            return;
        }

        setSubtasks([...subtasks, { id: Date.now(), name: '', completed: false }]);
    };

    const handleSubtaskNameChange = (id, value) => {
        setSubtasks(
            subtasks.map((subtask) =>
                subtask.id === id ? { ...subtask, name: value } : subtask
            )
        );
    };

    const handleDeleteSubtask = async (taskId, subtaskId) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        const updatedSubtasks = task.subtasks.filter((subtask) => subtask.id !== subtaskId);

        try {
            if (updatedSubtasks.length === 0) {
                await deleteDoc(doc(db, 'tasks', taskId));
            } else {
                await updateDoc(doc(db, 'tasks', taskId), { subtasks: updatedSubtasks });
            }
            fetchTasks();
        } catch (error) {
            console.error('Error deleting subtask:', error);
        }
    };

    const toggleSubtaskCompletion = async (taskId, subtaskId) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        const updatedSubtasks = task.subtasks.map((subtask) =>
            subtask.id === subtaskId
                ? { ...subtask, completed: !subtask.completed }
                : subtask
        );

        try {
            await updateDoc(doc(db, 'tasks', taskId), { subtasks: updatedSubtasks });
            fetchTasks();
        } catch (error) {
            console.error('Error toggling subtask completion:', error);
        }
    };

    const resetPopup = () => {
        setTaskName('');
        setSubtasks([]);
    };

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return (
        <div className="task-main">
            <h1>Task Manager</h1>
            <button className="add-new-task-button" onClick={() => setShowPopup(true)}>
                Add New Task
            </button>

            <div className="task-list">
                {tasks.map((task) => {
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
                                onClick={() => handleDeleteTask(task.id)}
                            >
                                ✕
                            </button>
                            <h3>{task.name}</h3>
                            <div className="progress-bar">
                                <div className="progress" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p>{progress}% completed</p>
                            <div>
                                {task.subtasks.map((subtask) => (
                                    <li key={subtask.id} className="subtask-item">
                                        <input
                                            type="checkbox"
                                            checked={subtask.completed}
                                            onChange={() => toggleSubtaskCompletion(task.id, subtask.id)}
                                        />
                                        <span className="subtask-name">{subtask.name}</span>
                                        <button
                                            className="delete-subtask"
                                            onClick={() => handleDeleteSubtask(task.id, subtask.id)}
                                        >
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
                            {subtasks.map((subtask) => (
                                <div key={subtask.id} className="subtask-item">
                                    <input
                                        type="text"
                                        placeholder="Subtask Name"
                                        value={subtask.name}
                                        onChange={(e) =>
                                            handleSubtaskNameChange(subtask.id, e.target.value)
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
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
