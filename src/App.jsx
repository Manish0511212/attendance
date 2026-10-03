import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Printer,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QRCodeCanvas } from "qrcode.react";
import {
  apiClient,
  createStudent,
  deleteStudent,
  getAttendance,
  getDashboard,
  getStudent,
  getStudents,
  login,
  markAttendance,
} from "./services/api";
import { Layout } from "./layout/Layout";

const navigation = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Students", path: "/students", icon: Users },
  { label: "QR Scanner", path: "/scanner", icon: QrCode },
  { label: "Attendance", path: "/attendance", icon: CalendarCheck2 },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Settings", path: "/settings", icon: Settings },
];
const cardClass =
  "rounded-2xl border border-[#dce5df] bg-white p-5 shadow-[0_8px_24px_rgba(31,107,76,.04)]";

function Alert({ message, tone = "error" }) {
  if (!message) return null;
  const displayMessage =
    message === "Database connection failed"
      ? "Attendance service unavailable"
      : message;
  return (
    <div
      className={`mb-5 flex items-center gap-3 rounded-xl p-4 text-sm font-semibold ${tone === "success" ? "bg-[#dcefe3] text-[#1f6b4c]" : "bg-[#fde5e0] text-[#b44d3e]"}`}
    >
      <AlertTriangle size={17} />
      {displayMessage}
    </div>
  );
}
function PageTitle({
  eyebrow = "Attendly workspace",
  title,
  description,
  action,
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold text-[#1f6b4c]">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[#718078]">{description}</p>
      </div>
      {action}
    </div>
  );
}
function StatCard({ label, value, detail, tone = "green" }) {
  return (
    <div className={cardClass}>
      <div className="flex justify-between gap-3">
        <div>
          <p className="text-sm text-[#718078]">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
          <p className="mt-2 text-xs text-[#718078]">{detail}</p>
        </div>
        <span
          className={`mt-1 size-3 rounded-full ${tone === "red" ? "bg-[#ef806d]" : tone === "gold" ? "bg-[#f2b866]" : "bg-[#72b98a]"}`}
        />
      </div>
    </div>
  );
}
function Loading() {
  return (
    <div className="grid min-h-48 place-items-center text-sm text-[#718078]">
      Loading live data...
    </div>
  );
}
function Empty({ text }) {
  return (
    <div className="grid min-h-32 place-items-center rounded-xl bg-[#f7f8f4] text-sm text-[#718078]">
      {text}
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@attendance.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await login({ email, password });
      localStorage.setItem("attendly-token", result.token);
      onLogin(result.user);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Database connection failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="grid-paper grid min-h-screen place-items-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-[2rem] border border-[#dce5df] bg-[#fbfcf8] p-7 shadow-[0_24px_80px_rgba(31,107,76,.12)] sm:p-10"
      >
        <div className="mb-9 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#1f6b4c] text-white">
            <ShieldCheck size={22} />
          </span>
          <span className="font-display text-2xl font-bold">Attendly</span>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[.16em] text-[#1f6b4c]">
          Admin / Teacher access
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold">
          Welcome back.
        </h1>
        <p className="mt-3 text-sm text-[#718078]">
          Sign in to manage live QR attendance.
        </p>
        <Alert message={error} />
        <label className="mt-8 block text-sm font-semibold">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="mt-2 h-12 w-full rounded-xl border border-[#dce5df] bg-white px-4 outline-none focus:border-[#1f6b4c]"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="mt-2 h-12 w-full rounded-xl border border-[#dce5df] bg-white px-4 outline-none focus:border-[#1f6b4c]"
          />
        </label>
        <button
          disabled={busy}
          className="mt-6 h-12 w-full rounded-xl bg-[#1f6b4c] text-sm font-bold text-white hover:bg-[#174e38] disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
        <p className="mt-5 text-center text-xs text-[#718078]">
          Demo: admin@attendance.com · admin123
        </p>
      </form>
    </main>
  );
}

function AppShell({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f7f8f4]">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[#dce5df] bg-[#fbfcf8] p-5 transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#1f6b4c] text-white">
              <ShieldCheck size={19} />
            </span>
            <span className="font-display text-xl font-bold">Attendly</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden">
            <X size={18} />
          </button>
        </div>
        <p className="mt-12 px-3 text-[11px] font-bold uppercase tracking-[.18em] text-[#9aa99f]">
          Workspace
        </p>
        <nav className="mt-3 space-y-1">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-[#dcefe3] text-[#1f6b4c]" : "text-[#718078] hover:bg-[#eef4ef]"}`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-[#dce5df] pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#eef4ef] p-3">
            <div className="grid size-9 place-items-center rounded-full bg-[#f2b866] text-xs font-bold">
              {user?.name?.slice(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.name || "Attendance Admin"}
              </p>
              <p className="text-xs text-[#718078]">{user?.role || "Admin"}</p>
            </div>
            <button
              onClick={onLogout}
              aria-label="Logout"
              title="Logout"
              className="text-[#718078] hover:text-[#b44d3e]"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="fixed inset-0 z-20 bg-[#17251f]/20 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <section className="min-w-0 lg:ml-0">
        <header className="flex h-20 items-center justify-between border-b border-[#dce5df] bg-[#fbfcf8] px-5 sm:px-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden">
              <Menu />
            </button>
            <div>
              <p className="text-xs text-[#718078]">Friday, October 02, 2026</p>
              <p className="font-display text-xl font-semibold">
                <CurrentTitle />
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-xl bg-[#eef4ef] px-3 py-2 text-sm font-semibold text-[#1f6b4c] sm:flex">
            <Bell size={15} />
            Live campus data
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-5 sm:p-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentProfile />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </section>
    </div>
  );
}
function CurrentTitle() {
  const path = window.location.pathname;
  return (
    navigation.find((item) => item.path === path)?.label ||
    (path.startsWith("/students/") ? "Student profile" : "Dashboard")
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError("Database connection failed"));
  }, []);
  if (error)
    return (
      <>
        <PageTitle title="Dashboard" description="Live attendance overview" />
        <Alert message={error} />
      </>
    );
  if (!data) return <Loading />;
  return (
    <>
      <PageTitle
        title="Attendance dashboard"
        description="Live MongoDB Atlas data across your campus."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total students"
          value={data.totalStudents}
          detail="Active students"
        />
        <StatCard
          label="Present today"
          value={data.presentToday}
          detail="Scanned present"
        />
        <StatCard
          label="Absent today"
          value={data.absentToday}
          detail="Needs follow-up"
          tone="red"
        />
        <StatCard
          label="Average attendance"
          value={`${data.averageAttendance}%`}
          detail="Across all students"
          tone="gold"
        />
        <StatCard
          label="Low attendance"
          value={data.lowAttendance}
          detail="Below 75%"
          tone="red"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">
                Daily attendance
              </h2>
              <p className="mt-1 text-sm text-[#718078]">
                Attendance calculated from MongoDB records
              </p>
            </div>
            <BarChart3 className="text-[#1f6b4c]" size={19} />
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily}>
                <CartesianGrid vertical={false} stroke="#e5ece7" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#1f6b4c"
                  fill="#dcefe3"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold">
            Department-wise attendance
          </h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departments} layout="vertical">
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar
                  dataKey="percentage"
                  fill="#72b98a"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className={`${cardClass} mt-6`}>
        <h2 className="font-display text-lg font-semibold">
          Semester-wise attendance
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {data.semesters.map((item) => (
            <div
              key={item.name}
              className="rounded-xl bg-[#f7f8f4] p-3 text-center"
            >
              <p className="text-xs text-[#718078]">{item.name}</p>
              <p className="mt-1 font-display text-xl font-semibold text-[#1f6b4c]">
                {item.percentage}%
              </p>
              <p className="text-[10px] text-[#718078]">
                {item.students} students
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [name, setName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    getStudents({ search, department, semester })
      .then(setStudents)
      .catch(() => setError("Database connection failed"));
  }, [search, department, semester]);
  async function addStudent(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    try {
      const timestamp = Date.now();
      const student = await createStudent({
        studentId: `STU${String(timestamp).slice(-3)}`,
        rollNumber: String(students.length + 1).padStart(2, "0"),
        name: trimmedName,
        email: `student${timestamp}@example.com`,
        phone: "9876543210",
        department: department || "Computer Science",
        semester: Number(semester) || 1,
        section: "A",
        academicYear: "2025-26",
        attendancePercentage: 0,
        presentDays: 0,
        absentDays: 0,
        totalClasses: 0,
        status: "Active",
      });
      setStudents((current) => [...current, student]);
      setName("");
      setDialogOpen(false);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to add student");
    }
  }
  return (
    <>
      <PageTitle
        title="Students"
        description="Academic year 2025-26 · live student data"
        action={
          <button
            onClick={() => setDialogOpen(true)}
            className="rounded-xl bg-[#1f6b4c] px-4 py-3 text-sm font-bold text-white"
          >
            + Add student
          </button>
        }
      />
      {dialogOpen && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#17251f]/30 p-4">
          <form
            onSubmit={addStudent}
            className="w-full max-w-md rounded-2xl border border-[#dce5df] bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Add student</h2>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                aria-label="Close dialog"
                className="text-2xl text-[#718078]"
              >
                ×
              </button>
            </div>
            <label className="mt-5 block text-sm font-semibold">
              Student name
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter full name"
                className="mt-2 h-11 w-full rounded-xl border border-[#dce5df] px-3 outline-none focus:border-[#1f6b4c]"
              />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl border border-[#dce5df] px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="rounded-xl bg-[#1f6b4c] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Add student
              </button>
            </div>
          </form>
        </div>
      )}
      <Alert message={error} />
      <div className={`${cardClass} overflow-hidden`}>
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_200px_130px]">
          <label className="relative block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa99f]"
              size={16}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, ID, roll number"
              className="h-11 w-full rounded-xl border border-[#dce5df] pl-9 pr-3 text-sm outline-none focus:border-[#1f6b4c]"
            />
          </label>
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="h-11 rounded-xl border border-[#dce5df] bg-white px-3 text-sm"
          >
            <option value="">All departments</option>
            {[
              "Computer Science",
              "Information Science",
              "Electronics",
              "Mechanical",
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={semester}
            onChange={(event) => setSemester(event.target.value)}
            className="h-11 rounded-xl border border-[#dce5df] bg-white px-3 text-sm"
          >
            <option value="">All semesters</option>
            {Array.from({ length: 8 }, (_, index) => (
              <option key={index + 1}>{index + 1}</option>
            ))}
          </select>
        </div>
        {students.length === 0 ? (
          <Empty text="No students found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#f7f8f4] text-xs uppercase tracking-wider text-[#718078]">
                <tr>
                  {[
                    "Student ID",
                    "Roll No",
                    "Name",
                    "Department",
                    "Sem",
                    "Sec",
                    "Attendance %",
                    "Status",
                    "QR",
                  ].map((head) => (
                    <th key={head} className="px-4 py-3 font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce5df]">
                {students.map((student) => (
                  <tr key={student.studentId} className="hover:bg-[#fbfcf8]">
                    <td className="px-4 py-4 font-semibold text-[#1f6b4c]">
                      {student.studentId}
                    </td>
                    <td className="px-4 py-4">{student.rollNumber}</td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/students/${student.studentId}`}
                        className="font-semibold hover:text-[#1f6b4c]"
                      >
                        {student.name}
                      </Link>
                      <p className="text-xs text-[#718078]">{student.email}</p>
                    </td>
                    <td className="px-4 py-4">{student.department}</td>
                    <td className="px-4 py-4">{student.semester}</td>
                    <td className="px-4 py-4">{student.section}</td>
                    <td
                      className={`px-4 py-4 font-bold ${student.attendancePercentage < 75 ? "text-[#c45f50]" : "text-[#1f6b4c]"}`}
                    >
                      {student.attendancePercentage}%
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-[#dcefe3] px-2.5 py-1 text-xs font-bold text-[#1f6b4c]">
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/students/${student.studentId}`}
                        className="text-[#1f6b4c]"
                      >
                        <QrCode size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function StudentProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getStudent(id)
      .then(setData)
      .catch(() => setError("Student not found"));
  }, [id]);
  if (error) return <Alert message={error} />;
  if (!data) return <Loading />;
  const { student, history } = data;
  return (
    <>
      <Link to="/students" className="text-sm font-bold text-[#1f6b4c]">
        ← Back to students
      </Link>
      <PageTitle
        title={student.name}
        description={`${student.studentId} · ${student.department} · Semester ${student.semester}`}
        action={
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm font-bold"
          >
            <Printer size={16} />
            Print profile
          </button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className={cardClass}>
          <div className="flex justify-center rounded-2xl bg-[#f7f8f4] p-6">
            <QRCodeCanvas value={student.studentId} size={180} includeMargin />
          </div>
          <p className="mt-3 text-center font-mono text-sm font-bold">
            {student.studentId}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              ["Total classes", student.totalClasses],
              ["Present", student.presentDays],
              ["Absent", student.absentDays],
              ["Attendance", `${student.attendancePercentage}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-[#f7f8f4] p-3">
                <p className="text-xs text-[#718078]">{label}</p>
                <p className="mt-1 font-display text-xl font-semibold">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold">
            Student information
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ["Email", student.email],
              ["Phone", student.phone],
              ["Roll number", student.rollNumber],
              ["Section", student.section],
              ["Academic year", student.academicYear],
              ["Status", student.status],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-[#718078]">{label}</p>
                <p className="mt-1 font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <h3 className="mt-8 font-display font-semibold">
            Eight-semester attendance
          </h3>
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8">
            {student.semesterAttendance.map((item) => (
              <div
                key={item.semester}
                className="rounded-xl bg-[#dcefe3] p-2 text-center"
              >
                <p className="text-[10px] text-[#1f6b4c]">S{item.semester}</p>
                <p className="font-bold text-[#1f6b4c]">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`${cardClass} mt-6`}>
        <h2 className="font-display text-lg font-semibold">
          Attendance history
        </h2>
        {history.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#f7f8f4] text-xs uppercase text-[#718078]">
                <tr>
                  {["Date", "Time", "Subject", "Status", "Marked by"].map(
                    (item) => (
                      <th key={item} className="px-4 py-3">
                        {item}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce5df]">
                {history.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3">{item.date}</td>
                    <td className="px-4 py-3">{item.time}</td>
                    <td className="px-4 py-3">{item.subject}</td>
                    <td className="px-4 py-3 font-semibold text-[#1f6b4c]">
                      {item.status}
                    </td>
                    <td className="px-4 py-3">{item.markedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="No attendance history found" />
        )}
      </div>
    </>
  );
}

function Scanner() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [student, setStudent] = useState(null);
  const scannerRef = useRef(null);
  async function scan(value) {
    setToken(value);
    try {
      const result = await markAttendance({
        studentId: value,
        subject: "Cloud Computing",
        markedBy: "Admin",
      });
      setStudent(result.student);
      setMessage("Attendance marked successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid QR Code");
    }
  }
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 220 },
      false,
    );
    scanner.render(
      (decoded) => {
        scan(decoded);
        scanner.clear().catch(() => {});
      },
      () => {},
    );
    scannerRef.current = scanner;
    return () => scanner.clear().catch(() => {});
  }, []);
  return (
    <>
      <PageTitle
        title="Scan QR Attendance"
        description="Scan a student's unique QR code to mark them Present today."
      />
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className={cardClass}>
          <div id="qr-reader" className="overflow-hidden rounded-xl" />
          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-[#9aa99f]">
            <span className="h-px flex-1 bg-[#dce5df]" />
            or enter manually
            <span className="h-px flex-1 bg-[#dce5df]" />
          </div>
          <div className="flex gap-2">
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="STU001"
              className="h-11 min-w-0 flex-1 rounded-xl border border-[#dce5df] px-3 text-sm"
            />
            <button
              onClick={() => scan(token)}
              className="rounded-xl bg-[#1f6b4c] px-4 text-sm font-bold text-white"
            >
              Mark present
            </button>
          </div>
        </div>
        <div className={cardClass}>
          {message && (
            <Alert
              message={message}
              tone={message.includes("successfully") ? "success" : "error"}
            />
          )}
          {student ? (
            <div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-[#1f6b4c]" size={24} />
                <h2 className="font-display text-xl font-semibold">
                  {student.name}
                </h2>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-[#718078]">Student ID</p>
                  <p className="font-semibold">{student.studentId}</p>
                </div>
                <div>
                  <p className="text-xs text-[#718078]">Roll number</p>
                  <p className="font-semibold">{student.rollNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-[#718078]">Department</p>
                  <p className="font-semibold">{student.department}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid min-h-40 place-items-center text-center text-sm text-[#718078]">
              <QrCode size={42} className="mb-3 text-[#9bb8a5]" />
              Student details appear here after a scan.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Attendance() {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    month: "",
    department: "",
    semester: "",
    subject: "",
    status: "",
  });
  const [error, setError] = useState("");
  useEffect(() => {
    getAttendance(filters)
      .then(setRecords)
      .catch(() => setError("Database connection failed"));
  }, [filters]);
  return (
    <>
      <PageTitle
        title="Attendance records"
        description="January 2025 - December 2026 · filter student name and semester"
      />
      <Alert message={error} />
      <div className={`${cardClass} overflow-hidden`}>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            type="date"
            value={filters.date}
            onChange={(event) =>
              setFilters({ ...filters, date: event.target.value })
            }
            className="h-11 rounded-xl border border-[#dce5df] px-3 text-sm"
          />
          <input
            type="month"
            min="2025-01"
            max="2026-12"
            value={filters.month}
            onChange={(event) =>
              setFilters({ ...filters, month: event.target.value })
            }
            className="h-11 rounded-xl border border-[#dce5df] px-3 text-sm"
            aria-label="Filter by month"
          />
          <select
            value={filters.department}
            onChange={(event) =>
              setFilters({ ...filters, department: event.target.value })
            }
            className="h-11 rounded-xl border border-[#dce5df] bg-white px-3 text-sm"
          >
            <option value="">Department</option>
            {[
              "Computer Science",
              "Information Science",
              "Electronics",
              "Mechanical",
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={filters.semester}
            onChange={(event) =>
              setFilters({ ...filters, semester: event.target.value })
            }
            className="h-11 rounded-xl border border-[#dce5df] bg-white px-3 text-sm"
          >
            <option value="">Semester</option>
            {Array.from({ length: 8 }, (_, index) => (
              <option key={index + 1}>{index + 1}</option>
            ))}
          </select>
          <input
            value={filters.subject}
            onChange={(event) =>
              setFilters({ ...filters, subject: event.target.value })
            }
            placeholder="Subject"
            className="h-11 rounded-xl border border-[#dce5df] px-3 text-sm"
          />
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters({ ...filters, status: event.target.value })
            }
            className="h-11 rounded-xl border border-[#dce5df] bg-white px-3 text-sm"
          >
            <option value="">Status</option>
            <option>Present</option>
            <option>Absent</option>
          </select>
        </div>
        {records.length === 0 ? (
          <Empty text="No attendance records found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#f7f8f4] text-xs uppercase text-[#718078]">
                <tr>
                  {[
                    "Date",
                    "Student ID",
                    "Student name",
                    "Semester",
                    "Subject",
                    "Time",
                    "Status",
                  ].map((item) => (
                    <th key={item} className="px-4 py-3">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce5df]">
                {records.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3">{item.date}</td>
                    <td className="px-4 py-3 font-semibold text-[#1f6b4c]">
                      {item.studentId}
                    </td>
                    <td className="px-4 py-3">{item.studentName}</td>
                    <td className="px-4 py-3">Sem {item.semester}</td>
                    <td className="px-4 py-3">{item.subject}</td>
                    <td className="px-4 py-3">{item.time}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "Present" ? "bg-[#dcefe3] text-[#1f6b4c]" : "bg-[#fde5e0] text-[#b44d3e]"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function Reports() {
  const [data, setData] = useState(null);
  useEffect(() => {
    getDashboard().then(setData);
  }, []);
  return (
    <>
      <PageTitle
        title="Reports"
        description="Daily, monthly, department, and semester attendance reports."
        action={
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-[#dce5df] bg-white px-4 py-3 text-sm font-bold"
          >
            <Download size={16} />
            Export report
          </button>
        }
      />
      {!data ? (
        <Loading />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={cardClass}>
            <h2 className="font-display text-lg font-semibold">
              Monthly attendance
            </h2>
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly}>
                  <CartesianGrid vertical={false} stroke="#e5ece7" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="present" fill="#72b98a" />
                  <Bar dataKey="absent" fill="#ef806d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={cardClass}>
            <h2 className="font-display text-lg font-semibold">
              Semester report
            </h2>
            <div className="mt-5 space-y-4">
              {data.semesters.map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{item.name}</span>
                    <strong>{item.percentage}%</strong>
                  </div>
                  <div className="h-2 rounded-full bg-[#eef4ef]">
                    <div
                      className="h-full rounded-full bg-[#1f6b4c]"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function SettingsPage() {
  return (
    <>
      <PageTitle
        title="Settings"
        description="Application and profile settings."
      />
      <div className={cardClass}>
        <h2 className="font-display text-lg font-semibold">Account</h2>
        <div className="mt-5 grid max-w-xl gap-4">
          <label className="text-sm font-semibold">
            Minimum attendance percentage
            <input
              defaultValue="75"
              type="number"
              className="mt-2 h-11 w-full rounded-xl border border-[#dce5df] px-3"
            />
          </label>
          <label className="flex items-center justify-between rounded-xl bg-[#f7f8f4] p-4 text-sm font-semibold">
            Low attendance notifications
            <input
              type="checkbox"
              defaultChecked
              className="size-4 accent-[#1f6b4c]"
            />
          </label>
          <button className="w-fit rounded-xl bg-[#1f6b4c] px-4 py-3 text-sm font-bold text-white">
            Save settings
          </button>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("attendly-user") || "null"),
  );
  function onLogin(value) {
    setUser(value);
    localStorage.setItem("attendly-user", JSON.stringify(value));
  }
  function logout() {
    localStorage.removeItem("attendly-token");
    localStorage.removeItem("attendly-user");
    setUser(null);
  }
  return user ? (
    <Routes>
      <Route element={<Layout user={user} onLogout={logout} />}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="scanner" element={<Scanner />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  ) : (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
