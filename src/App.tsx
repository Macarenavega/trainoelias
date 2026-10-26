import { useState } from 'react'
import { HistoryView } from './components/HistoryView'
import { SettingsView } from './components/SettingsView'
import { TimerBar } from './components/TimerBar'
import { TodayView } from './components/TodayView'
import { WorkoutView } from './components/WorkoutView'
import { exerciseLog, newWorkout, useAppState } from './lib/store'
import { unlockAudio, useTimer } from './lib/timer'

type Tab = 'today' | 'history' | 'settings'

export default function App() {
  const [state, update] = useAppState()
  const [tab, setTab] = useState<Tab>('today')
  const [inWorkout, setInWorkout] = useState(false)
  const timer = useTimer()

  return (
    <div className="min-h-dvh pb-40">
      <main className="mx-auto max-w-xl px-4 pt-6">
        {tab === 'today' && inWorkout && state.active ? (
          <WorkoutView
            workout={state.active}
            history={state.history}
            timer={timer}
            onChange={(fn) => update((s) => (s.active ? { ...s, active: fn(s.active) } : s))}
            onDiscard={() => {
              timer.stop()
              update((s) => ({ ...s, active: undefined }))
              setInWorkout(false)
            }}
            onSwap={(index, exercise, group, remember) =>
              update((s) => {
                if (!s.active) return s
                const swaps = { ...s.swaps }
                // Por defecto el cambio vale solo para esta sesión; volver al original borra lo recordado
                if (!exercise.swappedFrom) delete swaps[group]
                else if (remember) swaps[group] = exercise.id
                const exercises = s.active.exercises.map((e, i) => (i === index ? exerciseLog(exercise, s.history) : e))
                return { ...s, swaps, active: { ...s.active, exercises } }
              })
            }
            onFinish={() => {
              update((s) =>
                s.active
                  ? {
                      ...s,
                      active: undefined,
                      history: [...s.history, { ...s.active, finishedAt: new Date().toISOString() }],
                    }
                  : s,
              )
              setInWorkout(false)
            }}
          />
        ) : tab === 'today' ? (
          <TodayView
            state={state}
            onStart={(id) => {
              unlockAudio()
              update((s) => ({ ...s, active: newWorkout(s, id) }))
              setInWorkout(true)
            }}
            onResume={() => setInWorkout(true)}
            onWeekPlan={(key, days) =>
              update((s) => {
                const weekPlans = { ...s.weekPlans }
                if (days) weekPlans[key] = days
                else delete weekPlans[key]
                return { ...s, weekPlans }
              })
            }
          />
        ) : tab === 'history' ? (
          <HistoryView
            history={state.history}
            onDelete={(id) => update((s) => ({ ...s, history: s.history.filter((w) => w.id !== id) }))}
          />
        ) : (
          <SettingsView state={state} update={update} />
        )}
      </main>

      <TimerBar timer={timer} />

      <nav className="fixed inset-x-0 bottom-0 z-30 bg-stage pb-[env(safe-area-inset-bottom)] text-white">
        <div className="mx-auto flex max-w-xl">
          {(
            [
              ['today', state.active ? 'Entrenando' : 'Hoy', 'M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12'],
              ['history', 'Historial', 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4'],
              ['settings', 'Ajustes', 'M4 7h10M18 7h2M4 17h4M12 17h8M14 5v4M8 15v4'],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              className={`flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
                tab === id ? 'font-semibold text-white' : 'text-white/55'
              }`}
              onClick={() => {
                setTab(id)
                if (id === 'today' && state.active) setInWorkout(true)
              }}
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={icon} />
              </svg>
              <span className={`h-0.5 w-5 rounded-full ${tab === id ? 'bg-emerald-600' : 'bg-transparent'}`} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
