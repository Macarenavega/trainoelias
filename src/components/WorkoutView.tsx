import { useState } from 'react'
import { SESSIONS, blockPhases, findInSession, formatTarget, type Exercise } from '../data/routine'
import { lastLog, summarize, type ExerciseLog, type SetLog, type WorkoutLog } from '../lib/store'
import type { Phase, Timer } from '../lib/timer'
import { ExerciseGuide } from './ExerciseGuide'

type Props = {
  workout: WorkoutLog
  history: WorkoutLog[]
  timer: Timer
  onChange: (fn: (w: WorkoutLog) => WorkoutLog) => void
  onFinish: () => void
  onDiscard: () => void
  /**
   * Cambia el ejercicio de la posición indicada por otra opción de su grupo.
   * Por defecto solo para esta sesión; con `remember` se usa también en las próximas.
   */
  onSwap: (index: number, exercise: Exercise, group: string, remember: boolean) => void
}

const dateFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })

export function WorkoutView({ workout, history, timer, onChange, onFinish, onDiscard, onSwap }: Props) {
  const session = SESSIONS[workout.sessionId]
  const find = (id: string) => findInSession(session, id)
  const totalSets = workout.exercises.reduce((n, e) => n + e.sets.length, 0)
  const doneSets = workout.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0)
  const warmupDone = workout.warmup.every(Boolean)
  const [showWarmup, setShowWarmup] = useState(!warmupDone)
  const [swapping, setSwapping] = useState<number | null>(null)
  const [remember, setRemember] = useState(false)

  const updateExercise = (i: number, fn: (e: ExerciseLog) => ExerciseLog) =>
    onChange((w) => ({ ...w, exercises: w.exercises.map((e, j) => (j === i ? fn(e) : e)) }))

  const patchSet = (ei: number, si: number, patch: Partial<SetLog>) =>
    updateExercise(ei, (e) => ({ ...e, sets: e.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) }))

  const isLastSet = (ei: number, si: number) =>
    ei === workout.exercises.length - 1 && si === workout.exercises[ei].sets.length - 1

  const startRest = (ei: number, si: number) => {
    const ex = workout.exercises[ei]
    if (ex.rest > 0 && !isLastSet(ei, si)) {
      const next = si < ex.sets.length - 1 ? `${ex.name} — serie ${si + 2}` : `Siguiente: ${workout.exercises[ei + 1].name}`
      timer.start('rest', next, ex.rest)
    }
  }

  const completeSet = (ei: number, si: number, value: number | null) => {
    patchSet(ei, si, { value, done: true })
    startRest(ei, si)
  }

  const toggleSet = (ei: number, si: number) => {
    const ex = workout.exercises[ei]
    const set = ex.sets[si]
    if (set.done) return patchSet(ei, si, { done: false })
    const t = ex.target
    const fallback = t.kind === 'reps' ? (t.max >= 99 ? null : t.max) : t.kind === 'seconds' || t.kind === 'minutes' ? t.max : null
    completeSet(ei, si, set.value ?? fallback)
  }

  const startWork = (ei: number, si: number) => {
    const ex = workout.exercises[ei]
    const t = ex.target
    const label = ex.sets.length > 1 ? `${ex.name} — serie ${si + 1}` : ex.name
    if (t.kind === 'seconds') {
      const secs = ex.sets[si].value ?? t.max
      const phases: Phase[] = t.perSide
        ? [
            { label: 'Lado 1', seconds: secs },
            { label: 'Lado 2', seconds: secs },
          ]
        : [{ label, seconds: secs }]
      timer.start('work', label, phases, () => completeSet(ei, si, secs))
    } else if (t.kind === 'minutes') {
      const mins = ex.sets[si].value ?? t.min
      timer.start('work', label, Math.round(mins * 60), (elapsed) =>
        completeSet(ei, si, Math.round((elapsed / 60) * 10) / 10),
      )
    } else {
      const phases = blockPhases(t)
      if (phases) timer.start('work', label, phases)
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{session.place}</p>
          <h1 className="text-xl font-bold leading-tight">{workout.sessionName}</h1>
          <p className="text-sm text-muted">
            {doneSets}/{totalSets} series
          </p>
        </div>
        <button className="btn-ghost text-sm" onClick={() => confirm('¿Descartar este entrenamiento?') && onDiscard()}>
          Descartar
        </button>
      </header>

      <div className="h-2 overflow-hidden rounded-full bg-track">
        <div className="h-full bg-emerald-500 transition-[width]" style={{ width: `${(doneSets / totalSets) * 100}%` }} />
      </div>

      {session.intro && <p className="text-sm text-muted">{session.intro}</p>}

      {session.warmup.length > 0 && (
        <section className="card">
          <button className="flex w-full items-center justify-between" onClick={() => setShowWarmup((v) => !v)}>
            <span className="font-semibold">
              {session.warmupTitle ?? "Calentamiento (10')"} {warmupDone && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
            </span>
            <span className="text-muted">{showWarmup ? '▲' : '▼'}</span>
          </button>
          {showWarmup && (
            <ul className="mt-3 space-y-2">
              {session.warmup.map((item, i) => (
                <li key={item}>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="size-5 accent-emerald-600"
                      checked={workout.warmup[i] ?? false}
                      onChange={(e) =>
                        onChange((w) => ({ ...w, warmup: w.warmup.map((v, j) => (j === i ? e.target.checked : v)) }))
                      }
                    />
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {workout.exercises.map((ex, ei) => {
        const found = find(ex.exerciseId)
        if (!found) return null
        const m = found.exercise
        const swap = found.swap
        const allDone = ex.sets.every((s) => s.done)
        const prev = lastLog(history, ex.exerciseId)
        const prevDate = prev && history.find((w) => w.exercises.includes(prev))?.startedAt
        const prevBlock = ei > 0 ? find(workout.exercises[ei - 1].exerciseId)?.exercise.block : undefined
        const header = m.block && m.block !== prevBlock ? m.block : undefined
        return (
          <div key={ex.exerciseId} className="space-y-2">
            {header && <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-muted">{header}</h2>}
            <section className={`card ${allDone ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug">{ex.name}</h3>
                {allDone && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
              </div>
              {m.swappedFrom && <p className="text-xs text-muted">En lugar de: {m.swappedFrom}</p>}
              <p className="mt-1 text-sm text-muted">
                {formatTarget(m)}
                {ex.rest > 0 && ` · descanso ${ex.rest >= 60 && ex.rest % 60 === 0 ? `${ex.rest / 60}'` : `${ex.rest}"`}`}
              </p>
              {m.alternates && (
                <p className="mt-1 text-sm font-medium">
                  Esta semana toca: <span className="text-emerald-700 dark:text-emerald-400">{ex.level}</span>
                </p>
              )}
              {m.note && <p className="mt-1 text-sm text-muted italic">{m.note}</p>}
              {prev && (
                <p className="mt-1 text-sm">
                  <span className="text-muted">Última vez{prevDate ? ` (${dateFmt.format(new Date(prevDate))})` : ''}:</span>{' '}
                  <span className="tabular-nums">{summarize(prev)}</span>
                  {prev.level && !m.alternates && <span className="text-muted"> · {prev.level}</span>}
                </p>
              )}
              <ExerciseGuide guide={m.guide} />
              {swap && !allDone && (
                <button
                  className="mt-1 block text-xs text-muted underline underline-offset-2"
                  onClick={() => {
                    setSwapping(swapping === ei ? null : ei)
                    setRemember(false)
                  }}
                  aria-expanded={swapping === ei}
                >
                  {m.swappedFrom ? 'Volver al original o cambiar' : 'Alternativas (opcional)'}
                </button>
              )}
              {swap && swapping === ei && (
                <div className="mt-3 rounded-xl border border-line bg-page p-3">
                  <p className="text-sm font-medium">La rutina recomienda el ejercicio original.</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Usa una alternativa solo si lo necesitas (material ocupado o que falta) o si lo prefieres.
                  </p>
                  <ul className="mt-2 space-y-2">
                    {swap.options.map((opt, oi) => {
                      const current = opt.id === ex.exerciseId
                      return (
                        <li key={opt.id}>
                          <button
                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                              current ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'border-line bg-surface'
                            }`}
                            disabled={current}
                            onClick={() => {
                              if (ex.sets.some((s) => s.done) && !confirm('Ya marcaste series de este ejercicio. ¿Cambiarlo igual?'))
                                return
                              onSwap(ei, opt, swap.group, remember)
                              setSwapping(null)
                              setRemember(false)
                            }}
                          >
                            {opt.name}
                            {oi === 0 && <span className="text-muted"> (original)</span>}
                            {current && <span className="text-emerald-700 dark:text-emerald-400"> · actual</span>}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                  <label className="mt-3 flex items-start gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-emerald-600"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span>
                      Usar siempre la alternativa que elija en las próximas sesiones
                      <span className="block text-muted">Si no lo marcas, el cambio vale solo para hoy.</span>
                    </span>
                  </label>
                </div>
              )}

              {m.levelHint && (
                <label className="mt-3 block">
                  <span className="text-xs font-medium text-muted">Variante</span>
                  <input
                    className="input mt-1"
                    placeholder={m.levelHint}
                    value={ex.level}
                    onChange={(e) => updateExercise(ei, (x) => ({ ...x, level: e.target.value }))}
                  />
                </label>
              )}

              <div className="mt-3 space-y-2">
                {ex.sets.map((_, si) => (
                  <SetRow
                    key={si}
                    meta={m}
                    ex={ex}
                    index={si}
                    onPatch={(p) => patchSet(ei, si, p)}
                    onWeight={(kg) =>
                      updateExercise(ei, (e) => ({
                        ...e,
                        sets: e.sets.map((x, j) =>
                          j === si || (j > si && !x.done && (x.weight == null || x.weight === e.sets[si].weight))
                            ? { ...x, weight: kg }
                            : x,
                        ),
                      }))
                    }
                    onToggle={() => toggleSet(ei, si)}
                    onStart={() => startWork(ei, si)}
                    timerBusy={!!timer.timer && timer.timer.kind === 'work'}
                  />
                ))}
              </div>

              <input
                className="input mt-3 text-sm"
                placeholder="Notas (opcional)"
                value={ex.notes}
                onChange={(e) => updateExercise(ei, (x) => ({ ...x, notes: e.target.value }))}
              />
            </section>
          </div>
        )
      })}

      <button
        className="btn-primary w-full py-4 text-lg"
        onClick={() => {
          if (doneSets < totalSets && !confirm(`Te faltan ${totalSets - doneSets} series. ¿Terminar igual?`)) return
          timer.stop()
          onFinish()
        }}
      >
        Terminar entrenamiento
      </button>
    </div>
  )
}

type SetRowProps = {
  meta: Exercise
  ex: ExerciseLog
  index: number
  onPatch: (p: Partial<SetLog>) => void
  onWeight: (kg: number | null) => void
  onToggle: () => void
  onStart: () => void
  timerBusy: boolean
}

const num = (v: string) => (v === '' ? null : Number(v))

function SetRow({ meta, ex, index, onPatch, onWeight, onToggle, onStart, timerBusy }: SetRowProps) {
  const set = ex.sets[index]
  const t = ex.target
  const doneBtn = (
    <button
      className={`set-btn flex-1 px-2 text-sm ${set.done ? 'set-done' : ''}`}
      onClick={onToggle}
      aria-label={set.done ? 'Desmarcar serie' : 'Marcar serie como hecha'}
    >
      {set.done ? '✓' : 'Hecho'}
    </button>
  )
  const label = ex.sets.length > 1 ? `S${index + 1}` : ''

  if (t.kind === 'check') {
    return (
      <div className="flex items-center gap-2">
        <span className="w-7 shrink-0 text-sm text-muted">{label}</span>
        {doneBtn}
      </div>
    )
  }

  if (t.kind === 'amrap' || t.kind === 'emom' || t.kind === 'tabata') {
    return (
      <div className="space-y-2">
        <button className="btn-primary w-full py-3" onClick={onStart} disabled={timerBusy || set.done}>
          ▶ Empezar {formatTarget(meta)}
        </button>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-sm text-muted">Total</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className="input w-20 text-center tabular-nums"
            value={set.value ?? ''}
            onChange={(e) => onPatch({ value: num(e.target.value) })}
          />
          <span className="shrink-0 text-xs text-muted">{t.unit}</span>
          {doneBtn}
        </div>
      </div>
    )
  }

  const unit =
    t.kind === 'reps' ? (t.perSide ? 'reps/lado' : 'reps') : t.kind === 'seconds' ? (t.perSide ? 'seg/lado' : 'seg') : 'min'
  const placeholder = t.kind === 'minutes' ? String(t.min) : t.kind === 'reps' && t.max >= 99 ? '' : String(t.max)
  const timed = t.kind === 'seconds' || t.kind === 'minutes'
  const weighted = t.kind === 'reps' && t.weight

  return (
    <div className="flex items-center gap-2">
      <span className="w-7 shrink-0 text-sm text-muted">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        aria-label={unit}
        className="input w-16 px-1 text-center tabular-nums"
        placeholder={placeholder}
        value={set.value ?? ''}
        onChange={(e) => onPatch({ value: num(e.target.value) })}
      />
      <span className="shrink-0 text-xs text-muted">{unit}</span>
      {weighted && (
        <>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            aria-label="kg"
            className="input w-16 px-1 text-center tabular-nums"
            placeholder="kg"
            value={set.weight ?? ''}
            onChange={(e) => onWeight(num(e.target.value))}
          />
          <span className="shrink-0 text-xs text-muted">kg</span>
        </>
      )}
      {timed && !set.done && (
        <button className="set-btn" onClick={onStart} disabled={timerBusy} aria-label="Iniciar temporizador">
          ▶
        </button>
      )}
      {doneBtn}
    </div>
  )
}
