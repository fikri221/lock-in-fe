import React from 'react';
import TaskManager from './components/TaskManager';

const Home: React.FC = () => {

  return (
    <div className="pb-24 container">
      <h1 className="text-xl p-4">Daily Planner</h1>
      <TaskManager />
    </div>
  );
};

export default Home;