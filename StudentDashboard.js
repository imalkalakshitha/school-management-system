import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function StudentDashboard() {
  return (
    <div className="dashboard-container">
      <h1>Student Dashboard</h1>
      <p>Welcome, Student! Here you can view your classes.</p>
      <Link to="/">
        <button className="dashboard-button">Back to Home</button>
      </Link>
    </div>
  );
}

export default StudentDashboard;