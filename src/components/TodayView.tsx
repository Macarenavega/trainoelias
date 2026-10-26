import { useRef, useState, type RefObject } from 'react'
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
  const [openPlanner, setOpenPlanner] = useState(false)
  const plannerRef = useRef<HTMLElement>(null)
  const doneToday = state.history.some(
    (w) => w.sessionId === sessionId && new Date(w.startedAt).toDateString() === now.toDateString(),
  )

  return (
    <div className="space-y-4">
      <Hero
        state={state}
        now={now}
        sessionId={sessionId}
        isToday={sessionId === plan.session}
        doneToday={doneToday}
        restLabel={plan.restLabel}
        onStart={() => sessionId && onStart(sessionId)}
        onResume={onResume}
        onPlanDays={() => {
          setOpenPlanner(true)
          // Espera a que se abra el selector y lo lleva a la vista
          requestAnimationFrame(() => plannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
        }}
      />

      {!state.active && sessionId && <SessionCard id={sessionId} swaps={state.swaps} now={now} />}

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

      <WeekPlanner
        state={state}
        now={now}
        onWeekPlan={onWeekPlan}
        editing={openPlanner}
        setEditing={setOpenPlanner}
        cardRef={plannerRef}
      />
    </div>
  )
}

function SessionCard({ id, swaps, now }: { id: SessionId; swaps: AppState['swaps']; now: Date }) {
  const session = SESSIONS[id]
  return (
    <section className="card">
      <p className="eyebrow text-muted">En esta sesión</p>
      <ul className="mt-2 divide-y divide-line">
        {resolveSession(session, swaps).map((ex, i) => {
          const alt = alternateFor(ex, now)
          return (
            <li key={ex.id} className="flex items-baseline gap-3 py-2.5 text-sm">
              <span className="w-5 shrink-0 text-xs font-medium text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1">
                {ex.name}
                {alt && <span className="block text-xs text-emerald-700 dark:text-emerald-400">Esta semana: {alt}</span>}
                {ex.swappedFrom && <span className="block text-xs text-muted">en lugar de: {ex.swappedFrom}</span>}
              </span>
              <span className="shrink-0 text-right text-muted tabular-nums">{formatTarget(ex)}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** Portada oscura con foto: la sesión de hoy, cómo va la semana y el botón para empezar */
function Hero({
  state,
  now,
  sessionId,
  isToday,
  doneToday,
  restLabel,
  onStart,
  onResume,
  onPlanDays,
}: {
  state: AppState
  now: Date
  sessionId?: SessionId
  isToday: boolean
  doneToday: boolean
  restLabel?: string
  onStart: () => void
  onResume: () => void
  onPlanDays: () => void
}) {
  const session = sessionId ? SESSIONS[sessionId] : undefined
  const exercises = session ? resolveSession(session, state.swaps) : []
  const photoId = exercises.find((e) => e.guide.image)?.guide.image ?? 'Pullups'
  const photo = `${import.meta.env.BASE_URL}exercises/${photoId}/0.jpg`
  const stats = weekStats(state, now)
  const [name, detail] = session ? session.name.split(' — ') : []

  let eyebrow: string
  let title: string
  let subtitle: string
  if (state.active) {
    eyebrow = 'En curso'
    title = state.active.sessionName.split(' — ')[0]
    subtitle = 'Tu entrenamiento te espera donde lo dejaste.'
  } else if (session) {
    eyebrow = `${doneToday ? 'Hecho hoy ✓' : isToday ? 'Toca hoy' : 'Sesión elegida'} · ${session.place}`
    title = detail ?? name
    subtitle = `${detail ? `${name} · ` : ''}${exercises.length} ejercicios · ${session.estimate}`
  } else {
    eyebrow = 'Descanso'
    title = restLabel ?? 'Descanso'
    subtitle = 'Recuperar también es parte del plan.'
  }

  return (
    <section className="relative -mx-4 -mt-6 overflow-hidden bg-stage px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-7 text-white sm:mx-0 sm:mt-0 sm:rounded-3xl">
      <img src={photo} alt="" className="absolute inset-0 size-full object-cover opacity-45 grayscale contrast-125" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-stage via-stage/75 to-stage/35" aria-hidden />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-white/70">
            {DAY_NAMES[now.getDay()]} · {programOf(state).name}
          </p>
          <button
            className="shrink-0 rounded-[28px] border-[1.5px] border-white/60 px-3.5 py-1.5 text-sm font-medium active:bg-white/10"
            onClick={onPlanDays}
          >
            Elegir días
          </button>
        </div>

        <p className="eyebrow mt-20 text-emerald-400">{eyebrow}</p>
        <h1 className="mt-1 text-[40px] leading-[1.07] font-light tracking-[-0.008em]">{title}</h1>
        <p className="mt-2 text-white/70">{subtitle}</p>

        {(state.active || session) && (
          <button className="btn-primary mt-6 w-full py-4 text-lg" onClick={state.active ? onResume : onStart}>
            {state.active ? 'Continuar' : doneToday ? 'Repetir' : 'Empezar'}
          </button>
        )}

        <dl className="mt-7 grid grid-cols-3 border-t border-white/15 pt-4 text-center">
          <Stat value={`${stats.done}/${stats.planned}`} label="Esta semana" />
          <Stat value={stats.streak ? `${stats.streak}` : '–'} label={stats.streak === 1 ? 'Semana activa' : 'Semanas activas'} />
          <Stat value={`${stats.total}`} label="Sesiones" />
        </dl>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="text-2xl font-light tabular-nums">{value}</dd>
      <dd className="eyebrow mt-0.5 text-[10px] text-white/60">{label}</dd>
    </div>
  )
}

/** Sesiones de esta semana, semanas seguidas con al menos una sesión y total de sesiones */
function weekStats(state: AppState, now: Date) {
  const key = weekKey(now)
  const finished = state.history.filter((w) => w.finishedAt)
  const weeks = new Set(finished.map((w) => weekKey(new Date(w.startedAt))))
  const done = finished.filter((w) => weekKey(new Date(w.startedAt)) === key).length
  const planned = planWeek(programOf(state), state.weekPlans[key]).filter((d) => d.session).length
  // Racha: semanas seguidas entrenando, contando la actual solo si ya tiene alguna sesión
  const monday = new Date(`${key}T00:00:00`)
  if (!weeks.has(key)) monday.setDate(monday.getDate() - 7)
  let streak = 0
  while (weeks.has(weekKey(monday))) {
    streak++
    monday.setDate(monday.getDate() - 7)
  }
  return { done, planned, streak, total: finished.length }
}

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]
const shortDate = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })

function WeekPlanner({
  state,
  now,
  onWeekPlan,
  editing,
  setEditing,
  cardRef,
}: {
  state: AppState
  now: Date
  onWeekPlan: (key: string, days: number[] | undefined) => void
  editing: boolean
  setEditing: (fn: (v: boolean) => boolean) => void
  cardRef: RefObject<HTMLElement | null>
}) {
  const [offset, setOffset] = useState(0)
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
    <section ref={cardRef} className="card scroll-mt-4">
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
