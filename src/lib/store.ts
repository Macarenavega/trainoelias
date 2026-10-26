import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_PROGRAM,
  PROGRAMS,
  SESSIONS,
  alternateFor,
  resolveSession,
  type Exercise,
  type ProgramId,
  type SessionId,
  type Swaps,
  type Target,
} from '../data/routine'

export type SetLog = { value: number | null; weight: number | null; done: boolean }

export type ExerciseLog = {
  exerciseId: string
  name: string
  target: Target
  rest: number
  /** Variante (ej: tuck, archer) o la alternativa de la semana */
  level: string
  notes: string
  sets: SetLog[]
}

export type WorkoutLog = {
  id: string
  sessionId: SessionId
  sessionName: string
  startedAt: string
  finishedAt?: string
  warmup: boolean[]
  exercises: ExerciseLog[]
}

export type AppState = {
  version: 1
  history: WorkoutLog[]
  active?: WorkoutLog
  /** Ejercicios reemplazados (grupo → alternativa) */
  swaps: Swaps
  /** Días de entrenamiento elegidos por semana (clave: lunes AAAA-MM-DD; 0 = domingo … 6 = sábado) */
  weekPlans: Record<string, number[]>
  /** Programa elegido (Mes 1, Mes 2…). Sin valor se usa el programa actual */
  program?: ProgramId
}

/** Programa en uso */
export function programOf(state: AppState) {
  return PROGRAMS[state.program ?? DEFAULT_PROGRAM]
}

const KEY = 'trainoelias:v1'

const initialState: AppState = { version: 1, history: [], swaps: {}, weekPlans: {} }

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialState
    return { ...initialState, ...(JSON.parse(raw) as AppState) }
  } catch {
    return initialState
  }
}

function save(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Sin almacenamiento disponible: la app sigue funcionando en memoria
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(load)
  useEffect(() => save(state), [state])
  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), [])
  return [state, update] as const
}

/** Último registro terminado de un ejercicio */
export function lastLog(history: WorkoutLog[], exerciseId: string): ExerciseLog | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    const e = history[i].exercises.find((x) => x.exerciseId === exerciseId && x.sets.some((s) => s.done))
    if (e) return e
  }
  return undefined
}

export function newWorkout(state: AppState, sessionId: SessionId): WorkoutLog {
  const session = SESSIONS[sessionId]
  const today = new Date()
  return {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    sessionId,
    sessionName: session.name,
    startedAt: today.toISOString(),
    warmup: session.warmup.map(() => false),
    exercises: resolveSession(session, state.swaps).map((ex) => exerciseLog(ex, state.history, today)),
  }
}

export function exerciseLog(ex: Exercise, history: WorkoutLog[], today = new Date()): ExerciseLog {
  const prev = lastLog(history, ex.id)
  return {
    exerciseId: ex.id,
    name: ex.name,
    target: ex.target,
    rest: ex.rest,
    level: alternateFor(ex, today) ?? prev?.level ?? '',
    notes: '',
    // El peso arranca con el de la última vez, para ajustar solo si cambia
    sets: Array.from({ length: ex.sets }, (_, i) => ({
      value: null,
      weight: prev?.sets[i]?.weight ?? lastWeight(prev),
      done: false,
    })),
  }
}

function lastWeight(e: ExerciseLog | undefined) {
  const w = e?.sets.filter((s) => s.weight != null).at(-1)?.weight
  return w ?? null
}

/** "8×60kg · 8×60kg" o "22 series totales" */
export function summarize(e: ExerciseLog) {
  const t = e.target
  const unit =
    t.kind === 'seconds' ? '"' : t.kind === 'minutes' ? "'" : t.kind === 'amrap' || t.kind === 'emom' || t.kind === 'tabata' ? ` ${t.unit}` : ''
  return e.sets
    .map((s) => {
      if (!s.done) return '—'
      if (t.kind === 'check') return '✓'
      const v = s.value ?? '✓'
      return `${v}${s.value != null ? unit : ''}${s.weight ? `×${s.weight}kg` : ''}`
    })
    .join(' · ')
}
