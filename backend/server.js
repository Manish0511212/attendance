require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Student = require('./models/Student')
const Attendance = require('./models/Attendance')
const User = require('./models/User')

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

function tokenFor(user) { return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' }) }

function auth(req, res, next) {
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    if (!token) return res.status(401).json({ message: 'Authentication required' })
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next()
    } catch { res.status(401).json({ message: 'Invalid or expired token' }) }
}

function today() { return new Date().toISOString().slice(0, 10) }

function currentTime() { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }

app.get('/api/health', (_, res) => res.json({ ok: true, service: 'attendly-qr-api' }))
app.post('/api/auth/login', async(req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: tokenFor(user), user: { name: user.name, email: user.email, role: user.role } })
})
app.get('/api/dashboard', async(_, res) => {
    const [totalStudents, todayRecords, lowAttendance, average] = await Promise.all([Student.countDocuments({ status: 'Active' }), Attendance.find({ date: today() }), Student.countDocuments({ attendancePercentage: { $lt: 75 }, status: 'Active' }), Student.aggregate([{ $group: { _id: null, average: { $avg: '$attendancePercentage' } } }])]);
    const departments = await Student.aggregate([{ $group: { _id: '$department', average: { $avg: '$attendancePercentage' }, students: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    const semesters = await Student.aggregate([{ $group: { _id: '$semester', average: { $avg: '$attendancePercentage' }, students: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
    const daily = await Attendance.aggregate([{ $group: { _id: '$date', present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } }, total: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $limit: 14 }]);
    res.json({ totalStudents, presentToday: todayRecords.filter(item => item.status === 'Present').length, absentToday: todayRecords.filter(item => item.status === 'Absent').length, averageAttendance: Math.round((average[0] && average[0].average) || 0), lowAttendance, daily: daily.map(item => ({ date: item._id, percentage: Math.round((item.present / item.total) * 100) })), departments: departments.map(item => ({ name: item._id, percentage: Math.round(item.average), students: item.students })), semesters: semesters.map(item => ({ name: `Sem ${item._id}`, percentage: Math.round(item.average), students: item.students })), monthly: daily.map(item => ({ month: item._id.slice(5), present: item.present, absent: item.total - item.present })) })
})
app.get('/api/students', async(req, res) => {
    const filter = {...(req.query.department && { department: req.query.department }), ...(req.query.semester && { semester: Number(req.query.semester) }), ...(req.query.search && { $or: [{ name: new RegExp(req.query.search, 'i') }, { studentId: new RegExp(req.query.search, 'i') }, { rollNumber: new RegExp(req.query.search, 'i') }] }) };
    res.json(await Student.find(filter).sort({ studentId: 1 }))
})
app.get('/api/students/:id', async(req, res) => {
    const student = await Student.findOne({ $or: [{ studentId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }] });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const history = await Attendance.find({ studentId: student.studentId }).sort({ date: -1 });
    res.json({ student, history })
})
app.post('/api/students', auth, async(req, res) => {
    try {
        const student = await Student.create({...req.body, qrCode: req.body.studentId });
        res.status(201).json(student)
    } catch (error) { res.status(400).json({ message: error.message }) }
})
app.put('/api/students/:id', auth, async(req, res) => {
    const student = await Student.findOneAndUpdate({ studentId: req.params.id }, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student)
})
app.delete('/api/students/:id', auth, async(req, res) => {
    const student = await Student.findOneAndDelete({ studentId: req.params.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await Attendance.deleteMany({ studentId: req.params.id });
    res.json({ message: 'Student deleted' })
})
app.get('/api/attendance', async(req, res) => {
    const filter = {...(req.query.date && { date: req.query.date }), ...(req.query.month && { date: new RegExp(`^${req.query.month}`) }), ...(req.query.subject && { subject: req.query.subject }), ...(req.query.status && { status: req.query.status }), ...(req.query.department && { department: req.query.department }), ...(req.query.semester && { semester: Number(req.query.semester) }) };
    const records = await Attendance.find(filter).sort({ date: -1, time: -1 });
    const students = await Student.find({ studentId: { $in: records.map(item => item.studentId) } }).select('studentId name semester');
    const studentDetails = Object.fromEntries(students.map(student => [student.studentId, { name: student.name, semester: student.semester }]));
    res.json(records.map(record => {
        const student = studentDetails[record.studentId] || {}
        return {...record.toObject(), studentName: student.name || 'Unknown', semester: student.semester || record.semester }
    }))
})
app.get('/api/attendance/today', async(_, res) => res.json(await Attendance.find({ date: today() }).sort({ time: -1 })))
app.post('/api/attendance', async(req, res) => {
    const student = await Student.findOne({ studentId: req.body.studentId });
    if (!student) return res.status(404).json({ message: 'Invalid QR Code' });
    const date = req.body.date || today();
    const exists = await Attendance.findOne({ studentId: student.studentId, date });
    if (exists) return res.status(409).json({ message: 'Attendance already marked for today' });
    const record = await Attendance.create({ studentId: student.studentId, date, time: req.body.time || currentTime(), status: 'Present', subject: req.body.subject || 'Cloud Computing', department: student.department, semester: student.semester, markedBy: req.body.markedBy || 'Admin' });
    await Student.updateOne({ studentId: student.studentId }, { $inc: { presentDays: 1, totalClasses: 1 }, $set: { attendancePercentage: Math.round(((student.presentDays + 1) / (student.totalClasses + 1)) * 100) } });
    res.status(201).json({ message: 'Attendance marked successfully', student, record })
})

async function start() {
    try {
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
        await mongoose.connect(process.env.MONGODB_URI);
        const seed = require('./seed');
        if (typeof seed.runSeed === 'function') await seed.runSeed();
        app.listen(process.env.PORT || 4000, () => console.log(`Attendly API running on port ${process.env.PORT || 4000}`))
    } catch (error) {
        console.error('Database connection failed:', error.message, 'Set MONGODB_URI in backend/.env and restart the server.');
        process.exit(1)
    }
}
if (require.main === module) start()
module.exports = app