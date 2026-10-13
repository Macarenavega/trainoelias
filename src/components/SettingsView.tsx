import { RECORDS, alternativeName, groupName } from '../data/routine'
import type { AppState } from '../lib/store'

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
        <h2 className="font-semibold">Récords y notas del plan</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {RECORDS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

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
