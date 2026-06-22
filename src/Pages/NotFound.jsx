import React from 'react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/40 ring-1 ring-white/10 backdrop-blur-xl sm:p-10">
          <div className="absolute right-4 top-4 h-24 w-24 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute left-4 bottom-6 h-16 w-16 rounded-full bg-slate-200/5 blur-2xl" />
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">404 — page not found</p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Lost in the department?</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            The page you’re looking for isn’t available. Return to the home dashboard and continue exploring campus events.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/"
              className="inline-flex rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              Go back home
            </a>
            <a
              href="/"
              className="inline-flex rounded-full border border-slate-700 bg-white/5 px-6 py-3 text-sm text-slate-100 transition hover:bg-white/10"
            >
              Visit Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
