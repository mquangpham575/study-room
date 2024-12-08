import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../dblibs/firebase-config';
import './scheduleMain.css';

export const ScheduleMain = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', startTime: '', endTime: '', day: '' });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchEvents = async () => {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const fetchedEvents = querySnapshot.docs.map(doc => doc.data());
      setEvents(fetchedEvents);
    };

    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute} ${period}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startTimeFormatted = formatTime(newEvent.startTime);
    const endTimeFormatted = formatTime(newEvent.endTime);
    const time = `${startTimeFormatted}:${endTimeFormatted}`;
    const eventToAdd = { ...newEvent, time };
    setEvents([...events, eventToAdd]);
    setShowForm(false);
    setNewEvent({ title: '', startTime: '', endTime: '', day: '' });

    try {
      await addDoc(collection(db, 'events'), eventToAdd);
      console.log('Event added to Firebase');
    } catch (error) {
      console.error('Error adding event to Firebase: ', error);
    }
  };

  const Day = ({ day, events }) => {
    const displayEvents = events.length > 0 ? events : [{ title: '', time: '' }];
    return (
      <div className="day">
        <h2>{day}</h2>
        {displayEvents.map((event, index) => (
          <div key={index} className="event">
            <h3>{event.title}</h3>
            <p>{event.time}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="Schedule">
      <header>
        <h1>Weekly Calendar</h1>
      </header>
      <button className="add-event-button" onClick={() => setShowForm(true)}>Add More Event</button>
      {showForm && (
        <div className="popup-e">
          <button className="close-button-e" onClick={() => setShowForm(false)}>×</button>
          <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                placeholder="Event Title"
                required
              />
              <select name="day" value={newEvent.day} onChange={handleInputChange} required>
                <option value="">Select a day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <input
                type="time"
                name="startTime"
                value={newEvent.startTime}
                onChange={handleInputChange}
                required
              />
              <input
                type="time"
                name="endTime"
                value={newEvent.endTime}
                onChange={handleInputChange}
                required
              />
            <button type="submit" className="submit-button">Add Event</button>
          </form>
        </div>
      )}
      <div className="calendar">
        {daysOfWeek.map((day) => (
          <Day key={day} day={day} events={events.filter(event => event.day === day)} />
        ))}
      </div>
    </div>
  );
};
