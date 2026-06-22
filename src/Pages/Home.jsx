import React from 'react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-sky-200 shadow-sm shadow-sky-500/10">
              Departmental Information System
            </div>
            <div className="space-y-6">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                A smarter campus experience for college departments and events.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Manage announcements, track programs, and keep students connected with a modern departmental dashboard.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400">
                Add Event
              </button>
              <a href="#overview" className="rounded-full border border-slate-700 bg-white/5 px-6 py-3 text-sm text-slate-100 transition hover:bg-white/10">
                Learn more
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 shadow-xl shadow-slate-950/10">
                <h2 className="text-base font-semibold text-white">Central hub</h2>
                <p className="mt-3">A single place for departmental notices, event schedules, and important updates.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 shadow-xl shadow-slate-950/10">
                <h2 className="text-base font-semibold text-white">Built for campus teams</h2>
                <p className="mt-3">Designed for faculty, coordinators, and student bodies to share information quickly.</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10">
            <img
              src="/College.png"
              alt="College building"
              className="h-full w-full rounded-[1.75rem] object-cover shadow-inner shadow-slate-950/20"
            />
          </div>
        </section>

        <section id="overview" className="mt-16 rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-white">About the Departmental Information System</h2>
          <p className="mt-4 max-w-3xl text-slate-300 leading-8">
            This system provides an elegant information flow for college departments, helping students and staff stay informed about events, announcements, and academic life.
          </p>
        </section>
      </div>
    </div>
  )
}
