const mongoose = require('mongoose')

module.exports = mongoose.model('Attendance', new mongoose.Schema({
    studentId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent'], required: true },
    subject: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    markedBy: { type: String, required: true },
}, { timestamps: true }).index({ studentId: 1, date: 1 }, { unique: true }))