const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define a User schema (for students and teachers)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['teacher', 'student'] }, // Role can be 'teacher' or 'student'
  email: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', userSchema);

// Define a Class schema
const classSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Grade 6"
  section: { type: String, required: true }, // e.g., "A"
  classTeacher: { type: String, required: true }, // e.g., "Mr. Smith"
  maleStudents: [String], // List of male students
  femaleStudents: [String], // List of female students
  monitor: { type: String, required: true }, // e.g., "John Doe"
  description: { type: String }, // Additional field for "etc"
});

const Class = mongoose.model('Class', classSchema);

// Define Attendance Schema
const attendanceSchema = new mongoose.Schema({
  grade: { type: String, required: true },
  section: { type: String, required: true },
  date: { type: Date, required: true },
  attendance: { type: Map, of: String, required: true } // Map student names to attendance status
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// Define Assignment Schema
const assignmentSchema = new mongoose.Schema({
  grade: { type: String, required: true },
  section: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

// Define Grade Schema
const gradeSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  grade: { type: Number, required: true, min: 0, max: 100 }
});

const Grade = mongoose.model('Grade', gradeSchema);

// API Routes for Users
// Get all teachers
app.get('/api/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new user (for testing purposes)
app.post('/api/users', async (req, res) => {
  const { name, role, email } = req.body;
  const newUser = new User({ name, role, email });
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin Login Route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // Hardcoded admin credentials for simplicity
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// API Routes for Classes
// Get all classes
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single class by ID
app.get('/api/classes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new class
app.post('/api/classes', async (req, res) => {
  const { name, section, classTeacher, maleStudents, femaleStudents, monitor, description } = req.body;
  const newClass = new Class({
    name,
    section,
    classTeacher,
    maleStudents: maleStudents.split(',').map(student => student.trim()),
    femaleStudents: femaleStudents.split(',').map(student => student.trim()),
    monitor,
    description,
  });
  try {
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a class
app.put('/api/classes/:id', async (req, res) => {
  const { id } = req.params;
  const { name, section, classTeacher, maleStudents, femaleStudents, monitor, description } = req.body;
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      {
        name,
        section,
        classTeacher,
        maleStudents: maleStudents.split(',').map(student => student.trim()),
        femaleStudents: femaleStudents.split(',').map(student => student.trim()),
        monitor,
        description,
      },
      { new: true }
    );
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(updatedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a class
app.delete('/api/classes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedClass = await Class.findByIdAndDelete(id);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// API Routes for Attendance
app.get('/api/attendance', async (req, res) => {
  try {
    const { grade, section } = req.query;
    const attendance = await Attendance.find({ grade, section }).sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { grade, section, date, attendance } = req.body;
    const newAttendance = new Attendance({
      grade,
      section,
      date: new Date(date),
      attendance
    });
    const savedAttendance = await newAttendance.save();
    res.status(201).json(savedAttendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// API Routes for Assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const { grade, section } = req.query;
    const assignments = await Assignment.find({ grade, section }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/assignments', async (req, res) => {
  try {
    const { grade, section, title, description, dueDate } = req.body;
    const newAssignment = new Assignment({
      grade,
      section,
      title,
      description,
      dueDate: new Date(dueDate)
    });
    const savedAssignment = await newAssignment.save();
    res.status(201).json(savedAssignment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// API Routes for Grades
app.get('/api/grades', async (req, res) => {
  try {
    const { grade, section } = req.query;
    const assignments = await Assignment.find({ grade, section });
    const assignmentIds = assignments.map(a => a._id);
    const grades = await Grade.find({ assignmentId: { $in: assignmentIds } });
    
    // Format grades as a nested object for easier frontend consumption
    const formattedGrades = {};
    grades.forEach(grade => {
      if (!formattedGrades[grade.studentId]) {
        formattedGrades[grade.studentId] = {};
      }
      formattedGrades[grade.studentId][grade.assignmentId] = grade.grade;
    });
    
    res.json(formattedGrades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/grades', async (req, res) => {
  try {
    const { studentId, assignmentId, grade } = req.body;
    
    // Update grade if exists, create new if it doesn't
    const updatedGrade = await Grade.findOneAndUpdate(
      { studentId, assignmentId },
      { grade },
      { new: true, upsert: true }
    );
    
    res.json(updatedGrade);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});