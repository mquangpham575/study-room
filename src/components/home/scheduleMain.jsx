import './scheduleMain.css';
import React, { useState } from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewDay, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import PopupCreateEvent from './PopupCreateEvent';
import { createEventModalPlugin } from '@schedule-x/event-modal'

export const ScheduleMain = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [events] = useState([
    {
      id: '1',
      title: 'Event 1',
      start: '2024-12-06 01:00',
      end: '2024-12-06 02:00',
      description: 'good day'
    },
  ]);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
    events: events,
    selectedDate: '2024-12-06',
    plugins: [
      createDragAndDropPlugin(),
      createEventModalPlugin()
    ],
  });

  return (
    <div>
      <ScheduleXCalendar calendarApp={calendar} />
      <button className="create-room-button" onClick={togglePopup}>Create New Event</button>
      <PopupCreateEvent show={showPopup} onClose={togglePopup} />
    </div>
  );
};
