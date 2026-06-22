import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 text-slate-100 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3 text-sm sm:text-base">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-lg font-semibold text-white shadow-lg shadow-sky-500/20">
            DIS
          </div>
          <div>
            <p className="font-semibold tracking-[0.18em] uppercase text-white">Departmental Information</p>
            <p className="text-xs text-slate-400">College event hub</p>
          </div>
        </NavLink>

        <nav className="flex items-center gap-6 text-sm sm:gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'text-white underline underline-offset-4' : 'text-slate-300 hover:text-white'
            }
          >
            Home
          </NavLink>
          <a href="#overview" className="text-slate-300 hover:text-white">
            Overview
          </a>
          <a href="#events" className="text-slate-300 hover:text-white">
            Events
          </a>
          <a href="#contact" className="text-slate-300 hover:text-white">
            Contact
          </a>
        </nav>
      </div>
    </header>
  )
}
