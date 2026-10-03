const names = ['Rahul Sharma', 'Priya Shah', 'Arjun Patel', 'Ananya Mehta', 'Vikram Singh', 'Sneha Iyer', 'Rohan Kumar', 'Kavya Nair', 'Aditya Joshi', 'Meera Reddy', 'Sanjay Gupta', 'Ishita Rao', 'Karan Malhotra', 'Diya Menon', 'Aarav Das', 'Nisha Kapoor', 'Manish Verma', 'Pooja Jain', 'Yash Thakur', 'Aditi Bhat', 'Varun Sinha', 'Riya Choudhary', 'Dev Mishra', 'Simran Kaur', 'Akash Roy', 'Neha Kulkarni', 'Harsh Vyas', 'Tanvi Desai', 'Nitin Pillai', 'Shruti Bose', 'Mohit Saxena', 'Manya Agarwal', 'Siddharth Naik', 'Pallavi Hegde', 'Abhishek Paul', 'Kritika Sen', 'Gaurav Tiwari', 'Lavanya Rao', 'Naveen Shetty', 'Ira Dutta', 'Aniket Yadav', 'Sakshi Patil', 'Ravi Narang', 'Ayesha Khan', 'Madhav Menon', 'Swati Ghosh', 'Ritesh Anand', 'Komal Soni', 'Vivek Bansal', 'Sonal Mathew']
const departments = ['Computer Science', 'Information Science', 'Electronics', 'Mechanical']
const subjects = ['Cloud Computing', 'Database Systems', 'Web Technologies', 'Operating Systems']
const key = 'attendly-demo-store'

function semesterAttendance(index) { return Array.from({ length: 8 }, (_, semester) => ({ semester: semester + 1, percentage: 76 + ((index * 5 + semester * 3) % 22) })) }

function makeStudents() { return names.map((name, index) => { const presentDays = 72 + ((index * 7) % 24); return { studentId: `STU${String(index + 1).padStart(3, '0')}`, rollNumber: String(index + 1).padStart(2, '0'), name, email: `${name.toLowerCase().replaceAll(' ', '.')}@example.com`, phone: `987654${String(3210 + index).padStart(4, '0')}`, department: departments[index % departments.length], semester: (index % 8) + 1, section: index % 2 ? 'B' : 'A', academicYear: '2025-26', qrCode: `STU${String(index + 1).padStart(3, '0')}`, attendancePercentage: presentDays, presentDays, absentDays: 100 - presentDays, totalClasses: 100, status: 'Active', semesterAttendance: semesterAttendance(index) } }) }

function today() { return new Date().toISOString().slice(0, 10) }

function read() {
    const current = JSON.parse(localStorage.getItem(key) || 'null');
    if (current) {
        const students = current.students.map(student => ({...student, academicYear: '2025-26' }));
        if (students.some((student, index) => student.academicYear !== current.students[index].academicYear)) return write({...current, students });
        return current;
    }
    const state = { students: makeStudents(), attendance: [] };
    localStorage.setItem(key, JSON.stringify(state));
    return state
}

function write(state) { localStorage.setItem(key, JSON.stringify(state)); return state }

function demoAttendance(state) {
    const monthlyRecords = state.students.flatMap((student, studentIndex) => Array.from({ length: 24 }, (_, monthIndex) => {
        const year = 2025 + Math.floor(monthIndex / 12);
        const month = monthIndex % 12 + 1;
        const date = `${year}-${String(month).padStart(2, '0')}-01`;
        return { _id: `demo-${student.studentId}-${date}`, studentId: student.studentId, studentName: student.name, date, time: `${String(9 + studentIndex % 3).padStart(2, '0')}:30 AM`, status: (studentIndex + monthIndex) % 5 === 0 ? 'Absent' : 'Present', subject: subjects[(studentIndex + monthIndex) % subjects.length], department: student.department, semester: student.semester, markedBy: 'Admin' };
    }));
    const existing = state.attendance || [];
    return [...monthlyRecords, ...existing.filter(record => !monthlyRecords.some(item => item.studentId === record.studentId && item.date === record.date))];
}

function saveAttendance(state, records) { return write({...state, attendance: records }) }
export function demoLogin({ email, password }) { if ((email === 'admin@attendance.com' || email === 'admin@edudash.edu') && password === 'admin123') return { token: 'demo-token', user: { name: 'Attendance Admin', email: 'admin@attendance.com', role: 'Admin' } }; throw new Error('Invalid email or password') }
export function dashboard() { const state = read(); const records = demoAttendance(state); const todays = records.filter(record => record.date === today()); const average = Math.round(state.students.reduce((sum, student) => sum + student.attendancePercentage, 0) / state.students.length); const departmentsData = departments.map(name => { const rows = state.students.filter(student => student.department === name); return { name, percentage: Math.round(rows.reduce((sum, student) => sum + student.attendancePercentage, 0) / rows.length), students: rows.length } }); const semesters = Array.from({ length: 8 }, (_, index) => { const rows = state.students.filter(student => student.semester === index + 1); return { name: `Sem ${index + 1}`, percentage: Math.round(rows.reduce((sum, student) => sum + student.attendancePercentage, 0) / rows.length), students: rows.length } }); const daily = [...new Set(records.map(record => record.date))].sort().map(date => { const rows = records.filter(record => record.date === date); return { date, percentage: Math.round(rows.filter(record => record.status === 'Present').length / rows.length * 100) } }); return { totalStudents: state.students.length, presentToday: todays.filter(record => record.status === 'Present').length, absentToday: todays.filter(record => record.status === 'Absent').length, averageAttendance: average, lowAttendance: state.students.filter(student => student.attendancePercentage < 75).length, daily, departments: departmentsData, semesters, monthly: daily.map(item => ({ month: item.date.slice(5), present: item.percentage, absent: 100 - item.percentage })) } }
export function students(params = {}) { const state = read(); const search = (params.search || '').toLowerCase(); return state.students.filter(student => (!search || `${student.name} ${student.studentId} ${student.rollNumber}`.toLowerCase().includes(search)) && (!params.department || student.department === params.department) && (!params.semester || student.semester === Number(params.semester))) }
export function student(id) { const state = read(); const found = state.students.find(item => item.studentId === id); if (!found) throw new Error('Student not found'); return { student: found, history: demoAttendance(state).filter(record => record.studentId === id).sort((a, b) => b.date.localeCompare(a.date)) } }
export function attendance(params = {}) { const state = read(); return demoAttendance(state).filter(record => (!params.date || record.date === params.date) && (!params.month || record.date.startsWith(params.month)) && (!params.department || record.department === params.department) && (!params.semester || record.semester === Number(params.semester)) && (!params.subject || record.subject.toLowerCase().includes(params.subject.toLowerCase())) && (!params.status || record.status === params.status)) }
export function markPresent({ studentId, subject = 'Cloud Computing', markedBy = 'Admin' }) {
    const state = read();
    const target = state.students.find(student => student.studentId === studentId);
    if (!target) {
        const error = new Error('Invalid QR Code');
        error.response = { data: { message: 'Invalid QR Code' } };
        throw error
    }
    const records = demoAttendance(state);
    if (records.some(record => record.studentId === studentId && record.date === today())) {
        const error = new Error('Attendance already marked for today');
        error.response = { data: { message: 'Attendance already marked for today' } };
        throw error
    }
    const record = { _id: `demo-${studentId}-${today()}`, studentId, studentName: target.name, date: today(), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), status: 'Present', subject, department: target.department, semester: target.semester, markedBy };
    target.presentDays += 1;
    target.totalClasses += 1;
    target.attendancePercentage = Math.round(target.presentDays / target.totalClasses * 100);
    saveAttendance(state, [...records, record]);
    write(state);
    return { message: 'Attendance marked successfully', student: target, record }
}
export function addStudent(data) {
    const state = read();
    const student = {...data, qrCode: data.studentId, semesterAttendance: semesterAttendance(state.students.length) };
    state.students.push(student);
    write(state);
    return student
}