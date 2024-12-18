import './home.css';
import { Profiles } from '../components/home/profiles.jsx';
import { MainHub } from '../components/home/mainHub.jsx';
import { ScheduleMain } from '../components/home/scheduleMain.jsx';

export const Schedule = () => {

  return (
      <div className = "containdo">
        <div/>
        <Profiles/>
        <MainHub displayComponent = {<ScheduleMain/>}/>
      </div>
  );
}