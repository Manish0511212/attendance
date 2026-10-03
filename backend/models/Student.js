const mongoose = require('mongoose')

const semesterAttendanceSchema = new mongoose.Schema({
    semester: { type: Number, min: 1, max: 8, required: true },
    percentage: { type: Number, min: 0, max: 100, required: true },
}, { _id: false })

module.exports = mongoose.model('Student', new mongoose.Schema({
    studentId: { type: String, required: true, unique: true, index: true },
    rollNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    department: { type: String, required: true, index: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    section: { type: String, required: true },
    academicYear: { type: String, required: true },
    qrCode: { type: String, required: true, unique: true },
    attendancePercentage: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    totalClasses: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    semesterAttendance: { type: [semesterAttendanceSchema], default: [] },
}, { timestamps: true }))