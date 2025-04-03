import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, Navigate, useLocation, useParams } from 'react-router-dom';
import './App.css';
import TeacherDashboard from './TeacherDashboard';

// Header Component
function Header({ isLoggedIn, handleLogout }) {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Smart School</Link>
      </div>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/teacher">Teachers</Link>
        <Link to="/student">Students</Link>
        {isLoggedIn ? (
          <>
            <Link to="/admin">Admin</Link>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <Link to="/login">Admin Login</Link>
        )}
      </nav>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="footer">
      <p>© 2025 Smart School. All rights reserved.</p>
      <div className="social-links">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
      </div>
    </footer>
  );
}

// Homepage Component
function HomePage() {
  const navigate = useNavigate();
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [studentData, setStudentData] = useState({ grade: '', section: '' });
  const [teacherData, setTeacherData] = useState({ grade: '', section: '' });

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    console.log('Student Data:', studentData);
    navigate('/student', { state: { grade: studentData.grade, section: studentData.section } });
  };

  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    console.log('Teacher Data:', teacherData);
    navigate('/teacher', { state: { grade: teacherData.grade, section: teacherData.section } });
  };

  return (
    <div className="homepage">
      <div className="hero">
        <h1>Welcome to class management system</h1>
        <p>A modern class  management system for teachers, students, and admins.</p>

        {!showStudentForm && !showTeacherForm ? (
          <div className="role-buttons">
            <button onClick={() => setShowTeacherForm(true)}>
              Are you a Teacher?
            </button>
            <button onClick={() => setShowStudentForm(true)}>
              Are you a Student?
            </button>
          </div>
        ) : showStudentForm ? (
          <div className="form-container">
            <h3>Student Information</h3>
            <form onSubmit={handleStudentSubmit}>
              <div>
                <label>Grade: </label>
                <select
                  value={studentData.grade}
                  onChange={(e) => setStudentData({ ...studentData, grade: e.target.value })}
                  required
                >
                  <option value="">Select Grade</option>
                  {[6, 7, 8, 9, 10, 11].map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Section: </label>
                <select
                  value={studentData.section}
                  onChange={(e) => setStudentData({ ...studentData, section: e.target.value })}
                  required
                >
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setShowStudentForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        ) : (
          <div className="form-container">
            <h3>Teacher Information</h3>
            <form onSubmit={handleTeacherSubmit}>
              <div>
                <label>Grade: </label>
                <select
                  value={teacherData.grade}
                  onChange={(e) => setTeacherData({ ...teacherData, grade: e.target.value })}
                  required
                >
                  <option value="">Select Grade</option>
                  {[6, 7, 8, 9, 10, 11].map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Section: </label>
                <select
                  value={teacherData.section}
                  onChange={(e) => setTeacherData({ ...teacherData, section: e.target.value })}
                  required
                >
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                </select>
              </div>
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setShowTeacherForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// Teacher View Component
function TeacherView() {
  const [teachers, setTeachers] = React.useState([]);
  const [classes, setClasses] = React.useState([]);
  const location = useLocation();
  const { grade, section } = location.state || {};

  React.useEffect(() => {
    fetch('http://localhost:5000/api/teachers')
      .then((res) => res.json())
      .then((data) => setTeachers(data))
      .catch((err) => console.error('Error fetching teachers:', err));

    fetch('http://localhost:5000/api/classes')
      .then((res) => res.json())
      .then((data) => setClasses(data))
      .catch((err) => console.error('Error fetching classes:', err));
  }, []);

  const filteredClasses = classes.filter(
    (classItem) => classItem.name === `Grade ${grade}` && classItem.section === section
  );

  return (
    <div className="view-container">
      <h2>Teacher Dashboard</h2>
      <h3>Your Classes (Grade {grade}, Section {section})</h3>
      {filteredClasses.length === 0 ? (
        <p>No classes found for Grade {grade}, Section {section}.</p>
      ) : (
        <ul>
          {filteredClasses.map((classItem) => (
            <li key={classItem._id}>
              <strong>Class:</strong> {classItem.name} - {classItem.section} <br />
              <strong>Class Teacher:</strong> {classItem.classTeacher} <br />
              <strong>Male Students:</strong> {classItem.maleStudents.join(', ')} <br />
              <strong>Female Students:</strong> {classItem.femaleStudents.join(', ')} <br />
              <strong>Monitor:</strong> {classItem.monitor} <br />
              <strong>Description:</strong> {classItem.description || 'N/A'}
            </li>
          ))}
        </ul>
      )}
      <h3>All Teachers</h3>
      {teachers.length === 0 ? (
        <p>No teachers found.</p>
      ) : (
        <ul>
          {teachers.map((teacher) => (
            <li key={teacher._id}>
              {teacher.name} - {teacher.email}
            </li>
          ))}
        </ul>
      )}
      <Link to="/" className="back-link">Back to Home</Link>
    </div>
  );
}

// Student View Component
function StudentView() {
  const [students, setStudents] = React.useState([]);
  const [classes, setClasses] = React.useState([]);
  const location = useLocation();
  const { grade, section } = location.state || {};

  React.useEffect(() => {
    fetch('http://localhost:5000/api/students')
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error('Error fetching students:', err));

    fetch('http://localhost:5000/api/classes')
      .then((res) => res.json())
      .then((data) => setClasses(data))
      .catch((err) => console.error('Error fetching classes:', err));
  }, []);

  const filteredClasses = classes.filter(
    (classItem) => classItem.name === `Grade ${grade}` && classItem.section === section
  );

  return (
    <div className="view-container">
      <h2>Student Dashboard</h2>
      <h3>Your Class (Grade {grade}, Section {section})</h3>
      {filteredClasses.length === 0 ? (
        <p>No classes found for Grade {grade}, Section {section}.</p>
      ) : (
        <ul>
          {filteredClasses.map((classItem) => (
            <li key={classItem._id}>
              <strong>Class:</strong> {classItem.name} - {classItem.section} <br />
              <strong>Class Teacher:</strong> {classItem.classTeacher} <br />
              <strong>Male Students:</strong> {classItem.maleStudents.join(', ')} <br />
              <strong>Female Students:</strong> {classItem.femaleStudents.join(', ')} <br />
              <strong>Monitor:</strong> {classItem.monitor} <br />
              <strong>Description:</strong> {classItem.description || 'N/A'}
            </li>
          ))}
        </ul>
      )}
      <h3>All Students</h3>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <ul>
          {students.map((student) => (
            <li key={student._id}>
              {student.name} - {student.email}
            </li>
          ))}
        </ul>
      )}
      <Link to="/" className="back-link">Back to Home</Link>
    </div>
  );
}

// Class Management Component (Admin Only) - Modified
function ClassManagement() {
  const navigate = useNavigate();
  const [newClass, setNewClass] = React.useState({
    name: '',
    section: '',
    classTeacher: '',
    maleStudents: '',
    femaleStudents: '',
    monitor: '',
    description: '',
  });

  // Handle form input changes for creating a new class
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass({ ...newClass, [name]: value });
  };

  // Handle form submission to create a new class
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClass),
    })
      .then((res) => res.json())
      .then(() => {
        setNewClass({
          name: '',
          section: '',
          classTeacher: '',
          maleStudents: '',
          femaleStudents: '',
          monitor: '',
          description: '',
        });
      })
      .catch((err) => console.error('Error creating class:', err));
  };

  return (
    <div className="view-container">
      <h2>Class Management (Admin)</h2>

      {/* Form to create a new class */}
      <div className="form-container admin-form">
        <h3>Create a New Class</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Class Name: </label>
            <select
              name="name"
              value={newClass.name}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Grade</option>
              {[6, 7, 8, 9, 10, 11].map((grade) => (
                <option key={grade} value={`Grade ${grade}`}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Section: </label>
            <select
              name="section"
              value={newClass.section}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          <div>
            <label>Class Teacher: </label>
            <input
              type="text"
              name="classTeacher"
              value={newClass.classTeacher}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Male Students (comma-separated): </label>
            <input
              type="text"
              name="maleStudents"
              value={newClass.maleStudents}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Female Students (comma-separated): </label>
            <input
              type="text"
              name="femaleStudents"
              value={newClass.femaleStudents}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Monitor: </label>
            <input
              type="text"
              name="monitor"
              value={newClass.monitor}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Description: </label>
            <input
              type="text"
              name="description"
              value={newClass.description}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">Create Class</button>
        </form>
      </div>

      {/* Show All Classes Button */}
      <button
        className="toggle-classes-button"
        onClick={() => navigate('/admin/classes')}
      >
        Show All Classes
      </button>

      <Link to="/" className="back-link">Back to Home</Link>
    </div>
  );
}

// All Classes Component (New Page)
function AllClasses() {
  const [classes, setClasses] = React.useState([]);
  const navigate = useNavigate();

  // Fetch all classes when the component loads
  React.useEffect(() => {
    fetchClasses();
  }, []);

  // Function to fetch classes
  const fetchClasses = () => {
    fetch('http://localhost:5000/api/classes')
      .then((res) => res.json())
      .then((data) => setClasses(data))
      .catch((err) => console.error('Error fetching classes:', err));
  };

  // Handle delete button click
  const handleDeleteClick = (classId) => {
    fetch(`http://localhost:5000/api/classes/${classId}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then(() => {
        setClasses(classes.filter((classItem) => classItem._id !== classId));
      })
      .catch((err) => console.error('Error deleting class:', err));
  };

  return (
    <div className="view-container">
      <h2>All Classes</h2>
      {classes.length === 0 ? (
        <p>No classes found.</p>
      ) : (
        <table className="classes-table">
          <thead>
            <tr>
              <th>Class Name</th>
              <th>Section</th>
              <th>Class Teacher</th>
              <th>Male Students</th>
              <th>Female Students</th>
              <th>Monitor</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => (
              <tr key={classItem._id}>
                <td>{classItem.name}</td>
                <td>{classItem.section}</td>
                <td>{classItem.classTeacher}</td>
                <td>{classItem.maleStudents.join(', ')}</td>
                <td>{classItem.femaleStudents.join(', ')}</td>
                <td>{classItem.monitor}</td>
                <td>{classItem.description || 'N/A'}</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => navigate(`/admin/classes/edit/${classItem._id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteClick(classItem._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Link to="/admin" className="back-link">Back to Class Management</Link>
    </div>
  );
}

// Edit Class Component (New Page)
function EditClass() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editClassData, setEditClassData] = React.useState({
    name: '',
    section: '',
    classTeacher: '',
    maleStudents: '',
    femaleStudents: '',
    monitor: '',
    description: '',
  });

  // Fetch the class data when the component loads
  React.useEffect(() => {
    fetch(`http://localhost:5000/api/classes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEditClassData({
          name: data.name,
          section: data.section,
          classTeacher: data.classTeacher,
          maleStudents: data.maleStudents.join(', '),
          femaleStudents: data.femaleStudents.join(', '),
          monitor: data.monitor,
          description: data.description || '',
        });
      })
      .catch((err) => console.error('Error fetching class:', err));
  }, [id]);

  // Handle form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditClassData({ ...editClassData, [name]: value });
  };

  // Handle edit form submission
  const handleEditSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/api/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editClassData),
    })
      .then((res) => res.json())
      .then(() => {
        navigate('/admin/classes');
      })
      .catch((err) => console.error('Error updating class:', err));
  };

  return (
    <div className="view-container">
      <h2>Edit Class</h2>
      <div className="form-container admin-form">
        <form onSubmit={handleEditSubmit}>
          <div>
            <label>Class Name: </label>
            <select
              name="name"
              value={editClassData.name}
              onChange={handleEditInputChange}
              required
            >
              <option value="">Select Grade</option>
              {[6, 7, 8, 9, 10, 11].map((grade) => (
                <option key={grade} value={`Grade ${grade}`}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Section: </label>
            <select
              name="section"
              value={editClassData.section}
              onChange={handleEditInputChange}
              required
            >
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          <div>
            <label>Class Teacher: </label>
            <input
              type="text"
              name="classTeacher"
              value={editClassData.classTeacher}
              onChange={handleEditInputChange}
              required
            />
          </div>
          <div>
            <label>Male Students (comma-separated): </label>
            <input
              type="text"
              name="maleStudents"
              value={editClassData.maleStudents}
              onChange={handleEditInputChange}
              required
            />
          </div>
          <div>
            <label>Female Students (comma-separated): </label>
            <input
              type="text"
              name="femaleStudents"
              value={editClassData.femaleStudents}
              onChange={handleEditInputChange}
              required
            />
          </div>
          <div>
            <label>Monitor: </label>
            <input
              type="text"
              name="monitor"
              value={editClassData.monitor}
              onChange={handleEditInputChange}
              required
            />
          </div>
          <div>
            <label>Description: </label>
            <input
              type="text"
              name="description"
              value={editClassData.description}
              onChange={handleEditInputChange}
              required
            />
          </div>
          <button type="submit">Save Changes</button>
          <Link to="/admin/classes" className="cancel-button">Cancel</Link>
        </form>
      </div>
    </div>
  );
}

// Login Component
function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === 'Login successful') {
          setIsLoggedIn(true);
          localStorage.setItem('isLoggedIn', 'true');
          navigate('/admin');
        } else {
          setError(data.message);
        }
      })
      .catch((err) => {
        setError('An error occurred. Please try again.');
        console.error('Login error:', err);
      });
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, isLoggedIn }) {
  return isLoggedIn ? children : <Navigate to="/login" />;
}

// Main App Component with Routing
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <Router>
      <div className="app-wrapper">
        <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/student" element={<StudentView />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <ClassManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <AllClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes/edit/:id"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <EditClass />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;