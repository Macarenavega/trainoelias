import { formatClock, type Timer } from '../lib/timer'

export function TimerBar({ timer }: { timer: Timer }) {
  const t = timer.timer
  if (!t) return null
  const progress = 1 - timer.remaining / t.total
  const isRest = t.kind === 'rest'
  const multi = t.phases.length > 1
  const resting = multi && timer.phase?.label.includes('Descanso')

  return (
    <div className="fixed inset-x-0 bottom-16 z-20 px-3 pb-2">
      <div
        className={`mx-auto max-w-xl overflow-hidden rounded-2xl shadow-lg ${
          isRest || resting ? 'bg-sky-600' : 'bg-emerald-600'
        } text-white transition-colors`}
      >
        <div className="h-1 bg-white/30">
          <div className="h-full bg-white transition-[width]" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide opacity-80">
              {isRest ? 'Descanso' : multi ? timer.phase?.label : 'En curso'}
            </div>
            <div className="truncate text-sm font-medium">{t.label}</div>
            {multi && <div className="text-xs opacity-80 tabular-nums">Total: {formatClock(timer.remaining)}</div>}
          </div>
          <div className="text-3xl font-bold tabular-nums">
            {formatClock(multi ? (timer.phase?.remaining ?? 0) : timer.remaining)}
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-3">
          {isRest ? (
            <>
              <button className="btn-timer" onClick={() => timer.addSeconds(-15)}>
                −15"
              </button>
              <button className="btn-timer" onClick={() => timer.addSeconds(15)}>
                +15"
              </button>
              <button className="btn-timer flex-1" onClick={timer.stop}>
                Saltar descanso
              </button>
            </>
          ) : (
            <>
              <button className="btn-timer" onClick={timer.stop}>
                Cancelar
              </button>
              <button className="btn-timer flex-1" onClick={timer.finish}>
                Terminar ahora
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
