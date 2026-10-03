require('dotenv').config()
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const Student = require('./models/Student')
const Attendance = require('./models/Attendance')
const User = require('./models/User')

const names = ['Rahul Sharma', 'Priya Shah', 'Arjun Patel', 'Ananya Mehta', 'Vikram Singh', 'Sneha Iyer', 'Rohan Kumar', 'Kavya Nair', 'Aditya Joshi', 'Meera Reddy', 'Sanjay Gupta', 'Ishita Rao', 'Karan Malhotra', 'Diya Menon', 'Aarav Das', 'Nisha Kapoor', 'Manish Verma', 'Pooja Jain', 'Yash Thakur', 'Aditi Bhat', 'Varun Sinha', 'Riya Choudhary', 'Dev Mishra', 'Simran Kaur', 'Akash Roy', 'Neha Kulkarni', 'Harsh Vyas', 'Tanvi Desai', 'Nitin Pillai', 'Shruti Bose', 'Mohit Saxena', 'Manya Agarwal', 'Siddharth Naik', 'Pallavi Hegde', 'Abhishek Paul', 'Kritika Sen', 'Gaurav Tiwari', 'Lavanya Rao', 'Naveen Shetty', 'Ira Dutta', 'Aniket Yadav', 'Sakshi Patil', 'Ravi Narang', 'Ayesha Khan', 'Madhav Menon', 'Swati Ghosh', 'Ritesh Anand', 'Komal Soni', 'Vivek Bansal', 'Sonal Mathew']
const departments = ['Computer Science', 'Information Science', 'Electronics', 'Mechanical']
const subjects = ['Cloud Computing', 'Database Systems', 'Web Technologies', 'Operating Systems']
const today = new Date().toISOString().slice(0, 10)

function phone(index) { return `98${String(70000000 + index).padStart(8, '0')}` }

function semesterStats(index) { return Array.from({ length: 8 }, (_, i) => ({ semester: i + 1, percentage: 76 + ((index * 5 + i * 3) % 22) })) }

async function runSeed({ disconnect = false } = {}) {
    const studentCount = await Student.countDocuments()
    if (studentCount === 0) {
        const students = names.map((name, index) => {
            const presentDays = 72 + ((index * 7) % 24)
            const totalClasses = 100
            const absentDays = totalClasses - presentDays
            return { studentId: `STU${String(index + 1).padStart(3, '0')}`, rollNumber: String(index + 1).padStart(2, '0'), name, email: `${name.toLowerCase().replaceAll(' ', '.')}@example.com`, phone: phone(index), department: departments[index % departments.length], semester: (index % 8) + 1, section: index % 2 ? 'B' : 'A', academicYear: '2025-26', qrCode: `STU${String(index + 1).padStart(3, '0')}`, attendancePercentage: presentDays, presentDays, absentDays, totalClasses, status: 'Active', semesterAttendance: semesterStats(index) }
        })
        await Student.insertMany(students)
        const attendance = students.flatMap((student, studentIndex) => Array.from({ length: 24 }, (_, monthIndex) => {
            const year = 2025 + Math.floor(monthIndex / 12)
            const month = monthIndex % 12 + 1
            const date = `${year}-${String(month).padStart(2, '0')}-01`
            const present = (studentIndex + monthIndex) % 5 !== 0
            return { studentId: student.studentId, date, time: `${String(9 + (studentIndex % 3)).padStart(2, '0')}:30 AM`, status: present ? 'Present' : 'Absent', subject: subjects[(studentIndex + monthIndex) % subjects.length], department: student.department, semester: student.semester, markedBy: 'Admin' }
        }))
        await Attendance.insertMany(attendance)
        console.log('Seeded 50 students and sample attendance records')
    } else {
        await Student.updateMany({}, { $set: { academicYear: '2025-26' } })
        console.log(`Seed skipped: ${studentCount} students already exist; academic year updated to 2025-26`)
    }
    const admin = await User.findOne({ email: 'admin@attendance.com' })
    if (!admin) await User.create({ name: 'Attendance Admin', email: 'admin@attendance.com', password: await bcrypt.hash('admin123', 12), role: 'Admin' })
    console.log('Admin login ready: admin@attendance.com / admin123')
    if (disconnect) await mongoose.disconnect()
}

if (require.main === module) {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required')
    mongoose.connect(process.env.MONGODB_URI).then(() => runSeed({ disconnect: true })).catch(error => {
        console.error(error.message);
        process.exitCode = 1
    })
}

module.exports = { runSeed }