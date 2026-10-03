'use client'

import { useState } from 'react'
import { BarChart3, CheckCircle2, Download, QrCode, ScanLine, ShieldCheck } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

type Role = 'Admin' | 'Faculty' | 'Student'

const demoRows = [
  ['Alex Kim', 'CS301', 'Oct 04, 2024', 'Present'],
  ['Priya Shah', 'CS301', 'Oct 04, 2024', 'Present'],
  ['Noah Williams', 'CS301', 'Oct 04, 2024', 'Absent'],
  ['Mia Johnson', 'CS301', 'Oct 04, 2024', 'Present'],
]

function downloadReport() {
  const csv = ['Student,Subject,Date,Status', ...demoRows.map(row => row.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'attendly-attendance-report.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function AttendanceTools({ role, active }: { role: Role; active: string }) {
  const [qrValue, setQrValue] = useState('')
  const [expires, setExpires] = useState(0)
  const [scanToken, setScanToken] = useState('')
  const [scanMessage, setScanMessage] = useState('')
  const canManage = role !== 'Student'

  if (active !== 'Attendance' && active !== 'Reports') return null

  function generateQr() {
    const value = `attendly://attendance/${Date.now()}-${Math.random().toString(36).slice(2)}`
    setQrValue(value)
    setExpires(300)
    setScanMessage('')
  }

  function scanQr() {
    if (!scanToken.trim()) return setScanMessage('Paste a QR token to continue.')
    setScanMessage('Attendance marked Present for today.')
    setScanToken('')
  }

  return <div className="mt-6 grid gap-6 lg:grid-cols-2">
    {active === 'Attendance' && <div className="rounded-2xl border border-[#dce5df] bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[#1f6b4c]"><QrCode size={19} /><span className="text-xs font-bold uppercase tracking-[.16em]">QR attendance</span></div><h3 className="mt-3 font-[Space_Grotesk] text-xl font-semibold">{canManage ? 'Open a live attendance window' : 'Join with a QR token'}</h3><p className="mt-2 text-sm leading-6 text-[#718078]">{canManage ? 'Generate a single-use code for CS301. It automatically expires after five minutes.' : 'Scan the code shown by your faculty, then paste the token here to confirm your presence.'}</p></div><div className="grid size-10 place-items-center rounded-xl bg-[#dcefe3] text-[#1f6b4c]"><ShieldCheck size={18} /></div></div>
      {canManage ? <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start"><div className="grid size-44 place-items-center rounded-2xl border border-dashed border-[#a9c9b1] bg-[#f7fbf7]">{qrValue ? <QRCodeCanvas value={qrValue} size={132} includeMargin /> : <QrCode size={54} className="text-[#9bb8a5]" />}</div><div className="flex-1"><label className="block text-sm font-semibold">Class / subject<select className="mt-2 h-11 w-full rounded-xl border border-[#dce5df] bg-white px-3 text-sm"><option>CS301 · Data Structures · BSc CS-3A</option><option>CS305 · Database Systems · BSc CS-3A</option></select></label><button onClick={generateQr} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1f6b4c] px-4 text-sm font-bold text-white hover:bg-[#174e38]"><QrCode size={17} />{qrValue ? 'Regenerate QR code' : 'Generate QR code'}</button>{qrValue && <p className="mt-3 text-xs font-semibold text-[#c45f50]">Expires in {Math.floor(expires / 60)} minutes · Live demo token ready</p>}</div></div> : <div className="mt-6"><div className="flex items-center gap-2 rounded-xl bg-[#eef4ef] p-3 text-sm text-[#718078]"><ScanLine size={18} className="text-[#1f6b4c]" /> Use the camera scanner in your campus app, or paste the token below.</div><input value={scanToken} onChange={event => setScanToken(event.target.value)} placeholder="Paste QR token" className="mt-4 h-12 w-full rounded-xl border border-[#dce5df] px-4 text-sm outline-none focus:border-[#1f6b4c]" /><button onClick={scanQr} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1f6b4c] text-sm font-bold text-white hover:bg-[#174e38]"><ScanLine size={17} />Mark me present</button>{scanMessage && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#1f6b4c]"><CheckCircle2 size={16} />{scanMessage}</p>}</div>}
    </div>}
    {active === 'Reports' && <div className="rounded-2xl border border-[#dce5df] bg-white p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[#1f6b4c]"><BarChart3 size={19} /><span className="text-xs font-bold uppercase tracking-[.16em]">Reports</span></div><h3 className="mt-3 font-[Space_Grotesk] text-xl font-semibold">Build an attendance report</h3><p className="mt-2 text-sm leading-6 text-[#718078]">Filter a report by date, department, class, subject, or student.</p></div><button aria-label="Download report" title="Download report" onClick={downloadReport} className="grid size-10 place-items-center rounded-xl bg-[#dcefe3] text-[#1f6b4c] hover:bg-[#cce4d3]"><Download size={18} /></button></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Report type<select className="mt-2 h-11 w-full rounded-xl border border-[#dce5df] bg-white px-3 text-sm"><option>Daily attendance</option><option>Monthly attendance</option><option>Student-wise report</option><option>Subject-wise report</option><option>Class-wise report</option></select></label><label className="text-sm font-semibold">Date range<input type="date" defaultValue="2024-10-04" className="mt-2 h-11 w-full rounded-xl border border-[#dce5df] bg-white px-3 text-sm" /></label><label className="text-sm font-semibold">Department<select className="mt-2 h-11 w-full rounded-xl border border-[#dce5df] bg-white px-3 text-sm"><option>Computer Science</option><option>Business Administration</option><option>Mechanical Engineering</option></select></label><label className="text-sm font-semibold">Class<select className="mt-2 h-11 w-full rounded-xl border border-[#dce5df] bg-white px-3 text-sm"><option>BSc CS-3A</option><option>BSc CS-3B</option></select></label></div><button onClick={downloadReport} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#1f6b4c] text-sm font-bold text-[#1f6b4c] hover:bg-[#eef4ef]"><Download size={17} />Export filtered CSV</button><p className="mt-3 text-center text-xs text-[#718078]">Excel/PDF export can use the same filtered REST response in production.</p></div>}
  </div>
}
