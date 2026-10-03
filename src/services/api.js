import axios from 'axios'
import { addStudent as addDemoStudent, attendance as demoAttendance, dashboard as demoDashboard, demoLogin, markPresent, student as demoStudent, students as demoStudents } from './demoStore'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api', timeout: 3500 })
export const apiClient = api
const fallback = (request, demo) => request.catch(error => { if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') return demo(); throw error })
export const getDashboard = () => fallback(api.get('/dashboard').then(response => response.data), demoDashboard)
export const getStudents = (params = {}) => fallback(api.get('/students', { params }).then(response => response.data), () => demoStudents(params))
export const getStudent = id => fallback(api.get(`/students/${id}`).then(response => response.data), () => demoStudent(id))
export const createStudent = data => fallback(api.post('/students', data).then(response => response.data), () => addDemoStudent(data))
export const updateStudent = (id, data) => api.put(`/students/${id}`, data).then(response => response.data)
export const deleteStudent = id => api.delete(`/students/${id}`).then(response => response.data)
export const getAttendance = params => fallback(api.get('/attendance', { params }).then(response => response.data), () => demoAttendance(params))
export const getTodayAttendance = () => fallback(api.get('/attendance/today').then(response => response.data), () => demoAttendance({ date: new Date().toISOString().slice(0, 10) }))
export const markAttendance = data => fallback(api.post('/attendance', data).then(response => response.data), () => markPresent(data))
export const login = credentials => fallback(api.post('/auth/login', credentials).then(response => response.data), () => demoLogin(credentials))