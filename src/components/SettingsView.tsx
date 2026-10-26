import { PROGRAMS, alternativeName, groupName, type ProgramId } from '../data/routine'
import { programOf, type AppState } from '../lib/store'

type Props = {
  state: AppState
  update: (fn: (s: AppState) => AppState) => void
}

export function SettingsView({ state, update }: Props) {
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `trainoelias-respaldo-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as AppState
      if (data.version !== 1 || !Array.isArray(data.history)) throw new Error()
      if (confirm('Esto reemplaza todos tus datos actuales. ¿Continuar?')) update(() => data)
    } catch {
      alert('El archivo no es un respaldo válido de Trainoelias.')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      <section className="card">
        <h2 className="font-semibold">Programa</h2>
        <p className="mt-1 text-sm text-muted">
          Elige qué rutina usar. Cambiar de programa no borra nada: el historial y los pesos se conservan, y los
          ejercicios que se repiten muestran tu última marca.
        </p>
        <div className="mt-3 space-y-2">
          {(Object.keys(PROGRAMS) as ProgramId[]).map((id) => {
            const p = PROGRAMS[id]
            const current = programOf(state).id === id
            return (
              <button
                key={id}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                  current ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'border-line bg-surface'
                }`}
                aria-pressed={current}
                onClick={() => update((s) => ({ ...s, program: id }))}
              >
                <span className="font-medium">{p.name}</span>
                {current && <span className="text-emerald-700 dark:text-emerald-400"> · en uso</span>}
                <span className="block text-muted">{p.description}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="card">
        <h2 className="font-semibold">Últimas marcas ({programOf(state).name})</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {programOf(state).records.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      {programOf(state).progressions.length > 0 && (
        <section className="card">
          <h2 className="font-semibold">Progresiones</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {programOf(state).progressions.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h2 className="font-semibold">Ejercicios reemplazados</h2>
        <p className="mt-1 text-sm text-muted">
          La rutina siempre usa los ejercicios originales. Si algún día falta el material o está ocupado, en cada ejercicio
          hay un enlace <b>Alternativas (opcional)</b>: el cambio vale solo para esa sesión, salvo que marques usarlo
          siempre. Aquí aparecen los que elegiste usar siempre.
        </p>
        {Object.keys(state.swaps).length === 0 ? (
          <p className="mt-2 text-sm text-muted italic">Ninguno: se usa la rutina original.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {Object.entries(state.swaps).map(([group, altId]) => (
              <li key={group} className="flex items-center gap-3 py-2 text-sm">
                <div className="flex-1">
                  <p className="font-medium">{alternativeName(altId) ?? altId}</p>
                  <p className="text-muted">en lugar de: {groupName(group)}</p>
                </div>
                <button
                  className="btn-ghost px-3 py-1 text-sm"
                  onClick={() =>
                    update((s) => {
                      const swaps = { ...s.swaps }
                      delete swaps[group]
                      return { ...s, swaps }
                    })
                  }
                >
                  Volver al original
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="font-semibold">Cómo funcionan los bloques</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            <b>AMRAP</b>: tantas repeticiones o series como puedas en el tiempo indicado. Al final anota el total.
          </li>
          <li>
            <b>EMOM</b>: al inicio de cada minuto haces las reps indicadas y descansas lo que sobre. La app avisa con un
            pitido cada minuto.
          </li>
          <li>
            <b>Tabata</b>: 20" a máxima intensidad y 20" de descanso, 8 rondas. La app avisa en cada cambio.
          </li>
        </ul>
      </section>

      <section className="card">
        <h2 className="font-semibold">Créditos</h2>
        <p className="mt-1 text-sm text-muted">
          Imágenes de ejercicios de{' '}
          <a className="underline" href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer">
            free-exercise-db
          </a>{' '}
          (dominio público).
        </p>
      </section>

      <section className="card">
        <h2 className="font-semibold">Tus datos</h2>
        <p className="mt-1 text-sm text-muted">
          Todo se guarda solo en este dispositivo. Haz un respaldo de vez en cuando para no perderlo.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={exportData}>
            Descargar respaldo
          </button>
          <label className="btn-ghost cursor-pointer">
            Restaurar respaldo
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void importData(f)
                e.target.value = ''
              }}
            />
          </label>
        </div>
      </section>
    </div>
  )
}
