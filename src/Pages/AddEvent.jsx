import React, { useState, useCallback } from 'react'
import { eventSchema, sessionSchema, selectOptions, documentFields } from '../assets/Data'

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildEmpty(schema) {
	return Object.fromEntries(schema.map(f => [f.name, f.type === 'file' ? null : '']))
}

function buildEmptyDocs() {
	return Object.fromEntries(documentFields.map(d => [d, null]))
}

function buildEmptyTouched(schema) {
	return Object.fromEntries(schema.map(f => [f.name, false]))
}

// ─── Validation ─────────────────────────────────────────────────────────────

function validateField(field, value) {
	if (field.type === 'file') {
		if (field.required && !value) return `${field.label} is required.`
		return ''
	}

	const trimmed = typeof value === 'string' ? value.trim() : value

	if (field.required && !trimmed) return `${field.label} is required.`
	if (!trimmed) return '' // optional & empty → valid

	if (field.type === 'email') {
		const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRe.test(trimmed)) return 'Enter a valid email address.'
	}

	if (field.type === 'url') {
		try { new URL(trimmed) } catch { return 'Enter a valid URL.' }
	}

	if (field.type === 'date') {
		const d = new Date(trimmed)
		if (isNaN(d.getTime())) return 'Enter a valid date.'
	}

	if (field.type === 'number') {
		if (isNaN(Number(trimmed))) return 'Enter a valid number.'
		if (field.min !== undefined && Number(trimmed) < field.min) return `Value must be at least ${field.min}.`
		if (field.max !== undefined && Number(trimmed) > field.max) return `Value must be at most ${field.max}.`
	}

	if (field.minLength && trimmed.length < field.minLength)
		return `Minimum ${field.minLength} characters required.`

	return ''
}

function validateForm(schema, form) {
	return Object.fromEntries(schema.map(f => [f.name, validateField(f, form[f.name])]))
}

function validateSessions(sessions) {
	return sessions.map(s =>
		Object.fromEntries(sessionSchema.map(sf => [sf.name, validateField(sf, s[sf.name])]))
	)
}

function hasErrors(errObj) {
	return Object.values(errObj).some(Boolean)
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldInput({ field, value, error, touched, onChange, onBlur }) {
	const base = 'rounded-md border bg-transparent px-3 py-2 text-slate-100 outline-none transition focus:ring-2 focus:ring-sky-500'
	const borderClass = touched && error ? 'border-rose-500' : 'border-white/10 focus:border-sky-500'
	const cls = `${base} ${borderClass} w-full`

	return (
		<div className="flex flex-col">
			<label className="mb-1.5 text-sm font-medium text-slate-200">
				{field.label}
				{field.required && <span className="ml-1 text-rose-400">*</span>}
			</label>

			{field.type === 'textarea' ? (
				<textarea
					name={field.name}
					value={value || ''}
					onChange={onChange}
					onBlur={onBlur}
					rows={3}
					className={cls}
				/>
			) : field.type === 'select' ? (
				<select
					name={field.name}
					value={value || ''}
					onChange={onChange}
					onBlur={onBlur}
					className={`${cls} bg-slate-800`}
				>
					<option value="">— Select —</option>
					{(selectOptions[field.optionsKey] || []).map(opt => (
						<option key={opt} value={opt} className="bg-slate-800">{opt}</option>
					))}
				</select>
			) : field.type === 'file' ? (
				<input
					name={field.name}
					type="file"
					onChange={onChange}
					onBlur={onBlur}
					className="text-sm text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-sky-600 file:px-3 file:py-1 file:text-sm file:text-white hover:file:bg-sky-500"
				/>
			) : (
				<input
					name={field.name}
					type={field.type}
					value={value || ''}
					onChange={onChange}
					onBlur={onBlur}
					min={field.type === 'number' ? (field.min ?? 0) : undefined}
					onWheel={field.type === 'number' ? e => e.target.blur() : undefined}
					className={cls}
				/>
			)}

			{touched && error && (
				<p className="mt-1 text-xs text-rose-400">{error}</p>
			)}
		</div>
	)
}

function SessionCard({ session, sessionErrors, sessionTouched, index, onChange, onBlur, onRemove }) {
	return (
		<div className="rounded-lg border border-white/10 bg-white/5 p-4">
			<div className="mb-3 flex items-center justify-between">
				<span className="text-sm font-semibold text-slate-200">Session {index + 1}</span>
				<button
					type="button"
					onClick={onRemove}
					className="rounded-full px-2 py-0.5 text-xs text-rose-400 hover:bg-rose-500/10 transition"
				>
					Remove
				</button>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				{sessionSchema.map(sf => (
					<FieldInput
						key={sf.name}
						field={sf}
						value={session[sf.name]}
						error={sessionErrors?.[sf.name] || ''}
						touched={sessionTouched?.[sf.name] || false}
						onChange={e => onChange(index, e)}
						onBlur={e => onBlur(index, sf.name)}
					/>
				))}
			</div>
		</div>
	)
}

function DocumentsSection({ docs, docErrors, docTouched, onChange, onBlur }) {
	return (
		<div className="rounded-xl border border-white/10 bg-white/5 p-5">
			<h3 className="mb-4 text-base font-semibold text-slate-100">Documents</h3>
			<div className="grid gap-4 sm:grid-cols-2">
				{documentFields.map(d => {
					const isLink = d.toLowerCase().includes('link')
					const touched = docTouched?.[d] || false
					const error = docErrors?.[d] || ''
					return (
						<div key={d} className="flex flex-col">
							<label className="mb-1.5 text-sm text-slate-200">{d}</label>
							{isLink ? (
								<input
									name={d}
									type="text"
									value={docs[d] || ''}
									onChange={onChange}
									onBlur={() => onBlur(d)}
									placeholder="https://"
									className={`rounded-md border bg-transparent px-3 py-2 text-sm text-slate-100 outline-none transition focus:ring-2 focus:ring-sky-500 w-full ${touched && error ? 'border-rose-500' : 'border-white/10 focus:border-sky-500'}`}
								/>
							) : (
								<input
									name={d}
									type="file"
									onChange={onChange}
									onBlur={() => onBlur(d)}
									className="text-sm text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-sky-600 file:px-3 file:py-1 file:text-sm file:text-white hover:file:bg-sky-500"
								/>
							)}
							{touched && error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
						</div>
					)
				})}
			</div>
		</div>
	)
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AddEvent() {
	// Form state
	const [form, setForm] = useState(() => buildEmpty(eventSchema))
	const [sessions, setSessions] = useState([buildEmpty(sessionSchema)])
	const [docs, setDocs] = useState(buildEmptyDocs)

	// Error state
	const [formErrors, setFormErrors] = useState({})
	const [sessionErrors, setSessionErrors] = useState([{}])
	const [docErrors, setDocErrors] = useState({})

	// Touched state (blur tracking)
	const [formTouched, setFormTouched] = useState({})
	const [sessionTouched, setSessionTouched] = useState([{}])
	const [docTouched, setDocTouched] = useState({})

	// ── Event form handlers ──────────────────────────────────────────────────

	function handleChange(e) {
		const { name, value, type, files } = e.target
		const newVal = type === 'file' ? files[0] ?? null : value
		setForm(prev => ({ ...prev, [name]: newVal }))

		// Live-clear error once valid
		const field = eventSchema.find(f => f.name === name)
		if (field && formTouched[name]) {
			const err = validateField(field, newVal)
			setFormErrors(prev => ({ ...prev, [name]: err }))
		}
	}

	function handleBlur(fieldName) {
		setFormTouched(prev => ({ ...prev, [fieldName]: true }))
		const field = eventSchema.find(f => f.name === fieldName)
		if (field) {
			const err = validateField(field, form[fieldName])
			setFormErrors(prev => ({ ...prev, [fieldName]: err }))
		}
	}

	// ── Session handlers ─────────────────────────────────────────────────────

	function handleSessionChange(index, e) {
		const { name, value, type, files } = e.target
		const newVal = type === 'file' ? files[0] ?? null : value

		setSessions(prev => {
			const next = [...prev]
			next[index] = { ...next[index], [name]: newVal }
			return next
		})

		// Live-clear session error
		if (sessionTouched[index]?.[name]) {
			const field = sessionSchema.find(f => f.name === name)
			if (field) {
				const err = validateField(field, newVal)
				setSessionErrors(prev => {
					const next = [...prev]
					next[index] = { ...next[index], [name]: err }
					return next
				})
			}
		}
	}

	function handleSessionBlur(index, fieldName) {
		setSessionTouched(prev => {
			const next = [...prev]
			next[index] = { ...next[index], [fieldName]: true }
			return next
		})
		const field = sessionSchema.find(f => f.name === fieldName)
		if (field) {
			const err = validateField(field, sessions[index][fieldName])
			setSessionErrors(prev => {
				const next = [...prev]
				next[index] = { ...next[index], [fieldName]: err }
				return next
			})
		}
	}

	function addSession() {
		setSessions(prev => [...prev, buildEmpty(sessionSchema)])
		setSessionErrors(prev => [...prev, {}])
		setSessionTouched(prev => [...prev, {}])
	}

	function removeSession(i) {
		setSessions(prev => prev.filter((_, idx) => idx !== i))
		setSessionErrors(prev => prev.filter((_, idx) => idx !== i))
		setSessionTouched(prev => prev.filter((_, idx) => idx !== i))
	}

	// ── Document handlers ────────────────────────────────────────────────────

	function handleDocChange(e) {
		const { name, value, type, files } = e.target
		const newVal = type === 'file' ? files[0] ?? null : value
		setDocs(prev => ({ ...prev, [name]: newVal }))

		if (docTouched[name]) {
			// Basic link validation
			if (name.toLowerCase().includes('link') && newVal) {
				try { new URL(newVal); setDocErrors(prev => ({ ...prev, [name]: '' })) }
				catch { setDocErrors(prev => ({ ...prev, [name]: 'Enter a valid URL.' })) }
			} else {
				setDocErrors(prev => ({ ...prev, [name]: '' }))
			}
		}
	}

	function handleDocBlur(fieldName) {
		setDocTouched(prev => ({ ...prev, [fieldName]: true }))
		const val = docs[fieldName]
		if (fieldName.toLowerCase().includes('link') && val) {
			try { new URL(val); setDocErrors(prev => ({ ...prev, [fieldName]: '' })) }
			catch { setDocErrors(prev => ({ ...prev, [fieldName]: 'Enter a valid URL.' })) }
		}
	}

	// ── Submit ───────────────────────────────────────────────────────────────

	function onSubmit(e) {
		e.preventDefault()

		// Touch everything to show all errors
		const allFormTouched = Object.fromEntries(eventSchema.map(f => [f.name, true]))
		setFormTouched(allFormTouched)

		const allSessionTouched = sessions.map(() =>
			Object.fromEntries(sessionSchema.map(f => [f.name, true]))
		)
		setSessionTouched(allSessionTouched)

		// Run all validations
		const newFormErrors = validateForm(eventSchema, form)
		const newSessionErrors = validateSessions(sessions)

		setFormErrors(newFormErrors)
		setSessionErrors(newSessionErrors)

		// Check if anything is invalid
		const formInvalid = hasErrors(newFormErrors)
		const sessionsInvalid = newSessionErrors.some(hasErrors)
		const docsInvalid = hasErrors(docErrors)

		if (formInvalid || sessionsInvalid || docsInvalid) {
			console.warn('AddEvent: Form has validation errors — submission blocked.')
			return
		}

		const payload = { ...form, sessions, documents: docs }
		console.log('AddEvent payload:', payload)
	}

	// ── Reset ────────────────────────────────────────────────────────────────

	function onReset() {
		setForm(buildEmpty(eventSchema))
		setSessions([buildEmpty(sessionSchema)])
		setDocs(buildEmptyDocs())
		setFormErrors({})
		setSessionErrors([{}])
		setDocErrors({})
		setFormTouched({})
		setSessionTouched([{}])
		setDocTouched({})
	}

	// ─── Render ──────────────────────────────────────────────────────────────

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-12 text-slate-100">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div className="rounded-2xl bg-white/5 p-6 sm:p-8 shadow-2xl ring-1 ring-white/10">
					<h2 className="mb-1 text-2xl font-semibold tracking-tight">Add Department Event</h2>
					<p className="mb-8 text-sm text-slate-400">Fields marked <span className="text-rose-400">*</span> are required.</p>

					<form onSubmit={onSubmit} noValidate className="space-y-8">

						{/* ── Event Details ── */}
						<section>
							<h3 className="mb-4 text-base font-semibold text-slate-300 uppercase tracking-wider">Event Details</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								{eventSchema.map(field => (
									<FieldInput
										key={field.name}
										field={field}
										value={form[field.name]}
										error={formErrors[field.name] || ''}
										touched={formTouched[field.name] || false}
										onChange={handleChange}
										onBlur={() => handleBlur(field.name)}
									/>
								))}
							</div>
						</section>

						{/* ── Sessions ── */}
						<section>
						<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<h3 className="text-base font-semibold text-slate-300 uppercase tracking-wider">Sessions</h3>
							<button
								type="button"
								onClick={addSession}
								className="w-full rounded-full bg-sky-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-sky-500 sm:w-auto"
						>
							+ Add Session
						</button>
					</div>
									{sessions.map((s, idx) => (
										<SessionCard
											key={idx}
											index={idx}
											session={s}
											sessionErrors={sessionErrors[idx] || {}}
											sessionTouched={sessionTouched[idx] || {}}
											onChange={handleSessionChange}
											onBlur={handleSessionBlur}
											onRemove={() => removeSession(idx)}
										/>
									))}
								{/* </div>
							)} */}
						</section>

						{/* ── Documents ── */}
						<DocumentsSection
							docs={docs}
							docErrors={docErrors}
							docTouched={docTouched}
							onChange={handleDocChange}
							onBlur={handleDocBlur}
						/>

						{/* ── Actions ── */}
						<div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
							<button
								type="submit"
								className="w-full rounded-full bg-sky-600 px-7 py-2.5 font-semibold text-white transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 sm:w-auto"
							>
								Submit Event
							</button>
							<button
								type="button"
								onClick={onReset}
								className="w-full rounded-full border border-white/10 px-5 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 sm:w-auto"
							>
								Reset
							</button>
						</div>

					</form>
				</div>
			</div>
		</div>
	)
}