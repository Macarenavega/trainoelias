import { useCallback, useEffect, useRef, useState } from 'react'

let audioCtx: AudioContext | undefined

/** Debe llamarse desde un toque del usuario para que el navegador permita sonar después */
export function unlockAudio() {
  try {
    audioCtx ??= new AudioContext()
    if (audioCtx.state === 'suspended') void audioCtx.resume()
  } catch {
    // Sin audio disponible
  }
}

export function beep(times = 3, freq = 880) {
  try {
    navigator.vibrate?.(times > 1 ? [200, 100, 200, 100, 200] : 150)
  } catch {
    // Sin vibración
  }
  if (!audioCtx) return
  for (let i = 0; i < times; i++) {
    const t = audioCtx.currentTime + i * 0.35
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
    osc.connect(gain).connect(audioCtx.destination)
    osc.start(t)
    osc.stop(t + 0.3)
  }
}

export type TimerKind = 'rest' | 'work'
export type Phase = { label: string; seconds: number }

export type TimerState = {
  kind: TimerKind
  label: string
  /** Tramos consecutivos (EMOM: 1 por minuto; Tabata: trabajo/descanso) */
  phases: Phase[]
  total: number
  startedAt: number
  endsAt: number
}

/** Un único temporizador activo: descanso entre series o tiempo de trabajo (planchas, AMRAP, EMOM, Tabata) */
export function useTimer() {
  const [timer, setTimer] = useState<TimerState | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const onDone = useRef<((elapsed: number) => void) | undefined>(undefined)
  const lastPhase = useRef(0)

  useEffect(() => {
    if (!timer) return
    lastPhase.current = 0
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= timer.endsAt) {
        clearInterval(id)
        beep()
        const cb = onDone.current
        onDone.current = undefined
        setTimer(null)
        cb?.(timer.total)
        return
      }
      const idx = phaseAt(timer, t).index
      if (idx !== lastPhase.current) {
        lastPhase.current = idx
        beep(1, 660)
      }
    }, 250)
    return () => clearInterval(id)
  }, [timer])

  const start = useCallback(
    (kind: TimerKind, label: string, phases: number | Phase[], done?: (elapsed: number) => void) => {
      unlockAudio()
      onDone.current = done
      const list = typeof phases === 'number' ? [{ label, seconds: phases }] : phases
      const total = list.reduce((n, p) => n + p.seconds, 0)
      const t = Date.now()
      setNow(t)
      setTimer({ kind, label, phases: list, total, startedAt: t, endsAt: t + total * 1000 })
    },
    [],
  )

  const stop = useCallback(() => {
    onDone.current = undefined
    setTimer(null)
  }, [])

  /** Termina antes de tiempo, registrando lo que se alcanzó a hacer */
  const finish = useCallback(() => {
    if (!timer) return
    const elapsed = Math.max(1, Math.round((Date.now() - timer.startedAt) / 1000))
    const cb = onDone.current
    onDone.current = undefined
    setTimer(null)
    cb?.(elapsed)
  }, [timer])

  /** Solo para temporizadores de un tramo (descansos) */
  const addSeconds = useCallback((s: number) => {
    setTimer((t) => {
      if (!t || t.phases.length > 1) return t
      const endsAt = Math.max(Date.now() + 1000, t.endsAt + s * 1000)
      const total = Math.round((endsAt - t.startedAt) / 1000)
      return { ...t, endsAt, total, phases: [{ ...t.phases[0], seconds: total }] }
    })
  }, [])

  const remaining = timer ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000)) : 0
  const phase = timer ? phaseAt(timer, now) : undefined
  return { timer, remaining, phase, start, stop, finish, addSeconds }
}

function phaseAt(timer: TimerState, t: number) {
  let elapsed = (t - timer.startedAt) / 1000
  for (let i = 0; i < timer.phases.length; i++) {
    const p = timer.phases[i]
    if (elapsed < p.seconds || i === timer.phases.length - 1) {
      return { index: i, label: p.label, remaining: Math.max(0, Math.ceil(p.seconds - elapsed)) }
    }
    elapsed -= p.seconds
  }
  return { index: 0, label: timer.label, remaining: 0 }
}

export type Timer = ReturnType<typeof useTimer>

export function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
