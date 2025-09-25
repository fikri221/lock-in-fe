import React from 'react';
import TaskManager from './components/TaskManager';

const Home: React.FC = () => {

  return (
    <div className="pb-24 container">
      <TaskManager />
    </div>
  );
};

export default Home;