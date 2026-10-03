'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState('Student')
  const [email, setEmail] = useState('alex.kim@northstar.edu')
  const [message, setMessage] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const path = role === 'Admin' ? '/admin/dashboard' : role === 'Faculty' ? '/faculty/dashboard' : '/student/dashboard'
    setMessage('Signing you in securely...')
    window.setTimeout(() => router.push(path), 350)
  }

  return <main className="grid-paper min-h-screen p-4 sm:p-8">
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-[#dce5df] bg-[#fbfcf8] shadow-[0_24px_80px_rgba(31,107,76,.12)] lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden bg-[#1f6b4c] p-10 text-[#f7f8f4] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-80 rounded-full border-[36px] border-[#83c99b]/30" />
        <div><div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-[#f2b866] text-[#17251f]"><ShieldCheck size={22} /></div><span className="font-[Space_Grotesk] text-xl font-bold">Attendly</span></div><p className="mt-20 max-w-md font-[Space_Grotesk] text-5xl font-semibold leading-[1.03]">The pulse of your campus, in one place.</p><p className="mt-6 max-w-sm text-base leading-7 text-[#d2ead9]">Replace paper registers with a calm, connected workspace for every class, student, and attendance decision.</p></div>
        <div className="flex items-center gap-3 text-sm text-[#d2ead9]"><CheckCircle2 size={17} /> Secure access for every role</div>
      </section>
      <section className="flex items-center p-6 sm:p-12"><div className="w-full max-w-md"><div className="mb-10 lg:hidden"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#1f6b4c] text-white"><ShieldCheck size={20} /></div><span className="font-[Space_Grotesk] text-xl font-bold">Attendly</span></div></div><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#1f6b4c]">Northstar University</p><h1 className="mt-3 font-[Space_Grotesk] text-4xl font-semibold tracking-tight">Welcome back.</h1><p className="mt-3 text-[#718078]">Sign in to keep your campus moving.</p><form onSubmit={submit} className="mt-9 space-y-5"><label className="block text-sm font-semibold">Work email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#dce5df] bg-white px-4 outline-none transition focus:border-[#1f6b4c] focus:ring-4 focus:ring-[#dcefe3]" /></label><label className="block text-sm font-semibold">Password<div className="relative mt-2"><input required type="password" defaultValue="password" className="h-12 w-full rounded-xl border border-[#dce5df] bg-white px-4 pr-11 outline-none transition focus:border-[#1f6b4c] focus:ring-4 focus:ring-[#dcefe3]" /><LockKeyhole size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#718078]" /></div></label><div><p className="mb-2 text-sm font-semibold">Continue as</p><div className="grid grid-cols-3 gap-2">{['Student', 'Faculty', 'Admin'].map(item => <button type="button" key={item} onClick={() => setRole(item)} className={`rounded-xl border px-2 py-3 text-sm font-semibold transition ${role === item ? 'border-[#1f6b4c] bg-[#dcefe3] text-[#1f6b4c]' : 'border-[#dce5df] bg-white text-[#718078] hover:border-[#9bb8a5]'}`}>{item}</button>)}</div></div><button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1f6b4c] font-semibold text-white transition hover:bg-[#174e38]">Sign in as {role} <ArrowRight size={17} /></button>{message && <p className="text-center text-sm text-[#1f6b4c]">{message}</p>}</form><p className="mt-8 text-center text-xs text-[#718078]">Demo access is enabled. Connect the API to enforce JWT authentication.</p></div></section>
    </div>
  </main>
}
