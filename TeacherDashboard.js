import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Dashboard.css';

function TeacherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { grade, section } = location.state || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [classData, setClassData] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    // Fetch class data
    fetch(`http://localhost:5000/api/classes?grade=${grade}&section=${section}`)
      .then((res) => res.json())
      .then((data) => setClassData(data[0]))
      .catch((err) => console.error('Error fetching class data:', err));

    // Fetch attendance data
    fetch(`http://localhost:5000/api/attendance?grade=${grade}&section=${section}`)
      .then((res) => res.json())
      .then((data) => setAttendance(data))
      .catch((err) => console.error('Error fetching attendance:', err));

    // Fetch assignments
    fetch(`http://localhost:5000/api/assignments?grade=${grade}&section=${section}`)
      .then((res) => res.json())
      .then((data) => setAssignments(data))
      .catch((err) => console.error('Error fetching assignments:', err));

    // Fetch grades
    fetch(`http://localhost:5000/api/grades?grade=${grade}&section=${section}`)
      .then((res) => res.json())
      .then((data) => setGrades(data))
      .catch((err) => console.error('Error fetching grades:', err));
  }, [grade, section]);

  const handleAttendanceSubmit = (date, attendanceData) => {
    fetch('http://localhost:5000/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grade,
        section,
        date,
        attendance: attendanceData
      }),
    })
      .then((res) => res.json())
      .then((data) => setAttendance({ ...attendance, [date]: data }))
      .catch((err) => console.error('Error submitting attendance:', err));
  };

  const handleAssignmentCreate = (assignmentData) => {
    fetch('http://localhost:5000/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grade,
        section,
        ...assignmentData
      }),
    })
      .then((res) => res.json())
      .then((data) => setAssignments([...assignments, data]))
      .catch((err) => console.error('Error creating assignment:', err));
  };

  const handleGradeSubmit = (studentId, assignmentId, grade) => {
    fetch('http://localhost:5000/api/grades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        assignmentId,
        grade,
      }),
    })
      .then((res) => res.json())
      .then((data) => setGrades({ ...grades, [studentId]: { ...grades[studentId], [assignmentId]: data } }))
      .catch((err) => console.error('Error submitting grade:', err));
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <h2>Grade {grade} - Section {section}</h2>
        <nav className="dashboard-nav">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'attendance' ? 'active' : ''}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance
          </button>
          <button
            className={activeTab === 'assignments' ? 'active' : ''}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
          </button>
          <button
            className={activeTab === 'grades' ? 'active' : ''}
            onClick={() => setActiveTab('grades')}
          >
            Grades
          </button>
        </nav>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h3>Class Overview</h3>
            {classData ? (
              <div className="class-info">
                <p><strong>Class Teacher:</strong> {classData.classTeacher}</p>
                <p><strong>Total Students:</strong> {
                  (classData.maleStudents?.length || 0) + (classData.femaleStudents?.length || 0)
                }</p>
                <p><strong>Monitor:</strong> {classData.monitor}</p>
                <div className="student-lists">
                  <div className="male-students">
                    <h4>Male Students</h4>
                    <ul>
                      {classData.maleStudents?.map((student, index) => (
                        <li key={index}>{student}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="female-students">
                    <h4>Female Students</h4>
                    <ul>
                      {classData.femaleStudents?.map((student, index) => (
                        <li key={index}>{student}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading class information...</p>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="attendance-section">
            <h3>Attendance Management</h3>
            <div className="attendance-form">
              <h4>Take Attendance</h4>
              <div className="date-picker">
                <input type="date" id="attendance-date" />
              </div>
              {classData && (
                <div className="student-attendance">
                  {[...(classData.maleStudents || []), ...(classData.femaleStudents || [])].map((student, index) => (
                    <div key={index} className="attendance-row">
                      <span>{student}</span>
                      <select defaultValue="present">
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </select>
                    </div>
                  ))}
                  <button onClick={() => {
                    const date = document.getElementById('attendance-date').value;
                    const attendanceData = {};
                    [...(classData.maleStudents || []), ...(classData.femaleStudents || [])].forEach(student => {
                      const select = document.querySelector(`[data-student="${student}"]`);
                      attendanceData[student] = select.value;
                    });
                    handleAttendanceSubmit(date, attendanceData);
                  }}>
                    Submit Attendance
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="assignments-section">
            <h3>Assignment Management</h3>
            <div className="create-assignment">
              <h4>Create New Assignment</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const title = e.target.title.value;
                const description = e.target.description.value;
                const dueDate = e.target.dueDate.value;
                handleAssignmentCreate({ title, description, dueDate });
                e.target.reset();
              }}>
                <input type="text" name="title" placeholder="Assignment Title" required />
                <textarea name="description" placeholder="Assignment Description" required />
                <input type="date" name="dueDate" required />
                <button type="submit">Create Assignment</button>
              </form>
            </div>
            <div className="assignments-list">
              <h4>Current Assignments</h4>
              {assignments.length > 0 ? (
                <ul>
                  {assignments.map((assignment, index) => (
                    <li key={index} className="assignment-item">
                      <h5>{assignment.title}</h5>
                      <p>{assignment.description}</p>
                      <p><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No assignments created yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="grades-section">
            <h3>Grade Management</h3>
            {assignments.length > 0 && classData ? (
              <div className="grade-matrix">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      {assignments.map((assignment, index) => (
                        <th key={index}>{assignment.title}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...(classData.maleStudents || []), ...(classData.femaleStudents || [])].map((student, studentIndex) => (
                      <tr key={studentIndex}>
                        <td>{student}</td>
                        {assignments.map((assignment, assignmentIndex) => (
                          <td key={assignmentIndex}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={grades[student]?.[assignment._id] || ''}
                              onChange={(e) => handleGradeSubmit(student, assignment._id, e.target.value)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No assignments available for grading.</p>
            )}
          </div>
        )}
      </div>

      <div className="dashboard-footer">
        <Link to="/" className="back-button">Back to Home</Link>
      </div>
    </div>
  );
}

export default TeacherDashboard;
