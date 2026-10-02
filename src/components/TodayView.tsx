import { useState } from 'react'
import { DAY_NAMES, SCHEDULE, SESSIONS, alternateFor, formatTarget, type SessionId } from '../data/routine'
import type { AppState } from '../lib/store'

type Props = {
  state: AppState
  onStart: (id: SessionId) => void
  onResume: () => void
}

export function TodayView({ state, onStart, onResume }: Props) {
  const [now] = useState(() => new Date())
  const today = now.getDay()
  const plan = SCHEDULE[today]
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
            {(Object.keys(SESSIONS) as SessionId[]).map((id) => (
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

      <WeekPlan today={today} />
    </div>
  )
}

function SessionCard({
  id,
  now,
  isToday,
  doneToday,
  onStart,
}: {
  id: SessionId
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
        {session.exercises.map((ex) => {
          const alt = alternateFor(ex, now)
          return (
            <li key={ex.id} className="flex justify-between gap-3 py-2 text-sm">
              <span>
                {ex.name}
                {alt && <span className="block text-xs text-emerald-700 dark:text-emerald-400">Esta semana: {alt}</span>}
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

function WeekPlan({ today }: { today: number }) {
  const order = [1, 2, 3, 4, 5, 6, 0]
  return (
    <section className="card">
      <h3 className="font-semibold">Semana</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {order.map((d) => {
          const p = SCHEDULE[d]
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
