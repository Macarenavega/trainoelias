import { useState } from 'react'
import {
  DAY_NAMES,
  DAY_SHORT,
  SESSIONS,
  alternateFor,
  formatTarget,
  missingSessions,
  planWeek,
  resolveSession,
  weekKey,
  type SessionId,
} from '../data/routine'
import { programOf, type AppState } from '../lib/store'

type Props = {
  state: AppState
  onStart: (id: SessionId) => void
  onResume: () => void
  /** Guarda los días elegidos de una semana (undefined = volver al plan por defecto) */
  onWeekPlan: (key: string, days: number[] | undefined) => void
}

export function TodayView({ state, onStart, onResume, onWeekPlan }: Props) {
  const [now] = useState(() => new Date())
  const today = now.getDay()
  const program = programOf(state)
  const plan = planWeek(program, state.weekPlans[weekKey(now)])[today]
  const [picked, setPicked] = useState<SessionId | undefined>(plan.session)
  const sessionId = picked ?? plan.session
  const doneToday = state.history.some(
    (w) => w.sessionId === sessionId && new Date(w.startedAt).toDateString() === now.toDateString(),
  )

  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm text-muted">{DAY_NAMES[today]}</p>
        <h1 className="text-2xl font-bold">Hoy</h1>
      </header>

      {state.active ? (
        <section className="card">
          <p className="text-sm text-muted">Entrenamiento en curso</p>
          <h2 className="text-xl font-semibold">{state.active.sessionName}</h2>
          <button className="btn-primary mt-4 w-full py-3" onClick={onResume}>
            Continuar
          </button>
        </section>
      ) : sessionId ? (
        <SessionCard
          id={sessionId}
          swaps={state.swaps}
          now={now}
          isToday={sessionId === plan.session}
          doneToday={doneToday}
          onStart={() => onStart(sessionId)}
        />
      ) : (
        <section className="card text-center">
          <p className="text-4xl">🌿</p>
          <h2 className="mt-2 text-xl font-semibold">{plan.restLabel}</h2>
          <p className="mt-1 text-muted">Recuperar también es parte del plan.</p>
        </section>
      )}

      {!state.active && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-muted">Hacer otra sesión</h3>
          <div className="flex flex-wrap gap-2">
            {program.order.map((id) => (
              <button
                key={id}
                className={`chip ${id === sessionId ? 'chip-active' : ''}`}
                onClick={() => setPicked(id)}
              >
                {SESSIONS[id].name.split(' — ')[0]}
                <span className="opacity-70"> · {SESSIONS[id].place}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <WeekPlanner state={state} now={now} onWeekPlan={onWeekPlan} />
    </div>
  )
}

function SessionCard({
  id,
  swaps,
  now,
  isToday,
  doneToday,
  onStart,
}: {
  id: SessionId
  swaps: AppState['swaps']
  now: Date
  isToday: boolean
  doneToday: boolean
  onStart: () => void
}) {
  const session = SESSIONS[id]
  return (
    <section className="card">
      <p className="text-sm text-muted">
        {isToday ? 'Toca hoy' : 'Sesión elegida'} · {session.place}
      </p>
      <h2 className="text-xl font-semibold leading-tight">
        {session.name} {doneToday && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
      </h2>
      <p className="text-sm text-muted">Tiempo estimado: {session.estimate}</p>
      <ul className="mt-3 divide-y divide-line">
        {resolveSession(session, swaps).map((ex) => {
          const alt = alternateFor(ex, now)
          return (
            <li key={ex.id} className="flex justify-between gap-3 py-2 text-sm">
              <span>
                {ex.name}
                {alt && <span className="block text-xs text-emerald-700 dark:text-emerald-400">Esta semana: {alt}</span>}
                {ex.swappedFrom && <span className="block text-xs text-muted">en lugar de: {ex.swappedFrom}</span>}
              </span>
              <span className="shrink-0 text-right text-muted tabular-nums">{formatTarget(ex)}</span>
            </li>
          )
        })}
      </ul>
      <button className="btn-primary mt-4 w-full py-3 text-lg" onClick={onStart}>
        {doneToday ? 'Repetir' : 'Empezar'}
      </button>
    </section>
  )
}

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]
const shortDate = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })

function WeekPlanner({
  state,
  now,
  onWeekPlan,
}: {
  state: AppState
  now: Date
  onWeekPlan: (key: string, days: number[] | undefined) => void
}) {
  const [offset, setOffset] = useState(0)
  const [editing, setEditing] = useState(false)
  const ref = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset * 7)
  const key = weekKey(ref)
  const program = programOf(state)
  const chosen = state.weekPlans[key]
  const plan = planWeek(program, chosen)
  const days = chosen ?? WEEK_ORDER.filter((d) => plan[d].session)
  const missing = missingSessions(program, chosen)
  const monday = new Date(`${key}T00:00:00`)
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
  const today = offset === 0 ? now.getDay() : -1

  const toggle = (d: number) => onWeekPlan(key, days.includes(d) ? days.filter((x) => x !== d) : [...days, d])

  return (
    <section className="card">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">Semana · {program.name}</h3>
        <button className="text-sm font-medium text-emerald-700 dark:text-emerald-400" onClick={() => setEditing((v) => !v)}>
          {editing ? 'Listo' : 'Elegir días'}
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        {['Esta semana', 'Próxima semana'].map((label, i) => (
          <button key={label} className={`chip ${offset === i ? 'chip-active' : ''}`} onClick={() => setOffset(i)}>
            {label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">
        {shortDate.format(monday)} – {shortDate.format(sunday)}
        {chosen ? ' · días elegidos' : ' · plan por defecto'}
      </p>

      {editing && (
        <div className="mt-3 rounded-xl border border-line bg-page p-3">
          <p className="text-sm font-medium">¿Qué días entrenas?</p>
          <div className="mt-2 flex justify-between gap-1">
            {WEEK_ORDER.map((d) => (
              <button
                key={d}
                aria-label={DAY_NAMES[d]}
                aria-pressed={days.includes(d)}
                className={`size-10 rounded-full border text-sm font-semibold ${
                  days.includes(d) ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-line bg-surface'
                }`}
                onClick={() => toggle(d)}
              >
                {DAY_SHORT[d]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            Las sesiones se reparten en orden:{' '}
            {program.order.map((id) => `${SESSIONS[id].name.split(' — ')[0]} (${SESSIONS[id].place})`).join(', ')}.
          </p>
          {chosen && (
            <button className="mt-2 text-xs underline" onClick={() => onWeekPlan(key, undefined)}>
              Volver al plan por defecto
            </button>
          )}
        </div>
      )}

      {program.priority && <p className="mt-2 text-xs text-muted">{program.priority}</p>}

      {missing.length > 0 && (
        <p className="mt-3 rounded-lg bg-amber-50 p-2 text-sm dark:bg-amber-950/40">
          ⚠️ Con {days.length} {days.length === 1 ? 'día' : 'días'} quedan fuera:{' '}
          {missing.map((id) => SESSIONS[id].name.split(' — ')[0]).join(', ')}.
        </p>
      )}

      <ul className="mt-3 space-y-1 text-sm">
        {WEEK_ORDER.map((d) => {
          const p = plan[d]
          const s = p.session ? SESSIONS[p.session] : undefined
          return (
            <li key={d} className={`flex justify-between gap-3 ${d === today ? 'font-semibold' : ''}`}>
              <span className="w-24 shrink-0">{DAY_NAMES[d]}</span>
              <span className={`text-right ${s ? '' : 'text-muted'}`}>
                {s ? `${s.place} — ${s.name.split(' — ')[1]}` : p.restLabel}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
