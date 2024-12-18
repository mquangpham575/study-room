import './home.css';
import { Profiles } from '../components/home/profiles.jsx';
import { MainHub } from '../components/home/mainHub.jsx';
import { TaskMain } from '../components/home/taskMain.jsx';

export const Task = () => {

  return (
      <div className = "containdo">
        <div/>
        <Profiles/>
        <MainHub displayComponent = {<TaskMain/>}/>
      </div>
  );
}