import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { db } from '../dblibs/firebase-config';
import './scheduleMain.css';
import { useParams } from 'react-router-dom';
import { useUserStore } from '../dblibs/userStore';
import { usePreviewStore } from '../dblibs/previewUserStore';
import { toast } from 'react-toastify';

export const ScheduleMain = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', startTime: '', endTime: '', day: '' });
  const {currentUser} = useUserStore();
  const {previewUser, isLoading, curUserMore,
    fetchPrUserInfo , fetchProfileSubstitute, resetUserInfoForLoading} = usePreviewStore();

  let id = useParams().id;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(()=>{
    if (id === previewUser?.id)
      fetchProfileSubstitute(id, 'events', []);
    else {
      console.log("?!");
      resetUserInfoForLoading();
      fetchProfileSubstitute(id, 'events', []);
      fetchPrUserInfo(id);  
    }
  },[id,previewUser,fetchPrUserInfo, fetchProfileSubstitute, resetUserInfoForLoading]);

  useEffect(()=>{
    console.log('restarting', id, curUserMore);

    if (curUserMore?.events)
      {

        const fetchedEvents = [];
  
        daysOfWeek.forEach(x => {
          let requestedDay = curUserMore.events[x];
          for (let b in requestedDay)
            {
              let event = requestedDay[b];
              if (event !== undefined)
                {
                  event.day = x;
                  event.time = event.startTime + ' - ' + event.endTime;
  
                  fetchedEvents.push(event);
                }
            }  
        })
  
        setEvents(fetchedEvents);
      } else setEvents([]);
  }, [curUserMore]);

  if (isLoading) return <div className='globalLoad'>LOADING...</div>;
  if (previewUser == null) return <div className='globalLoad'> NO SUCH USER EXISTS. </div>;

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

    const eventToAdd = {
      startTime: formatTime(newEvent.startTime),
      endTime: formatTime(newEvent.endTime),
      title: newEvent.title
    };

    try {
      const docRef = doc(db, "events", currentUser.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists())
      {
        const upd = {};

        upd[newEvent.day] = arrayUnion(eventToAdd);
        await updateDoc(docRef, upd);
      } else {
        const props = {
          Monday: [], Tuesday: [], Wednesday: [], 
          Thursday: [], Friday: [], Saturday: [], 
        }

        props[newEvent.day].push(eventToAdd);

        await setDoc(docRef, props);
      }

      setEvents([...events, { ...eventToAdd,
        time: eventToAdd.startTime + ' - ' + eventToAdd.endTime,
        day: newEvent.day
      }]);

      setShowForm(false);
      setNewEvent({ title: '', startTime: '', endTime: '', day: '' });  

      toast.success('Event added successfully!');
    } catch (error) {
      toast.error('Failed to add event: ' + error.message);
    }
  };

  const handleDelete = async (event) => {
    try {
      const docRef = doc(db, "events", currentUser.id);
      const docSnap = await getDoc(docRef);

      console.log(event);

      if (docSnap.exists())
      {
        const upd = {};

        upd[event.day] = arrayRemove({
          startTime: event.startTime,
          endTime: event.endTime,
          title: event.title,
        });

        await updateDoc(docRef, upd);
      }
      
      setEvents(events.filter(x => x.title !== event.title));
      toast.success('Event deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete event: ' + error.message);
    }
  };

  const Day = ({ day, events }) => (
    <div className="day" key = {day}>
      <h2>{day}</h2>
      {events.map(event => (
        <div key={event.id} className="event">
          <button className="delete-button" onClick={() => handleDelete(event)}>×</button>
          <h3>{event.title}</h3>
          <p>{event.time}</p>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="Schedule">
      <header>
        <h1>{previewUser?.username + "'s Weekly Schedule"}</h1>
      </header>
      {currentUser.id === id && <button className="add-event-button" onClick={() => setShowForm(true)}>
        Add More Event
      </button>}
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
