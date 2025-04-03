import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to Smart School</h1>
        <p>A modern school management system for teachers and students.</p>
        <div className="button-group">
          <Link to="/teacher-dashboard">
            <button className="role-button teacher-button">Are you a Teacher?</button>
          </Link>
          <Link to="/student-dashboard">
            <button className="role-button student-button">Are you a Student?</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;