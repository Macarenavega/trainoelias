import { useState } from 'react'
import type { Guide } from '../data/routine'

const youtubeSearch = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`

/** "Cómo se hace": pasos breves, imágenes de referencia (si hay) y búsqueda de video */
export function ExerciseGuide({ guide }: { guide: Guide }) {
  const [open, setOpen] = useState(false)
  const src = (n: number) => `${import.meta.env.BASE_URL}exercises/${guide.image}/${n}.jpg`

  return (
    <div className="mt-2">
      <button className="text-sm font-medium text-emerald-700 dark:text-emerald-400" onClick={() => setOpen((v) => !v)}>
        {open ? 'Ocultar ▲' : 'Cómo se hace ▼'}
      </button>
      {open && (
        <div className="mt-2 space-y-3">
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {guide.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          {guide.image && (
            <figure>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1].map((n) => (
                  <div key={n}>
                    <img
                      src={src(n)}
                      alt={n === 0 ? 'Posición inicial' : 'Posición final'}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                    />
                    <p className="mt-0.5 text-center text-xs text-muted">{n === 0 ? 'Inicio' : 'Final'}</p>
                  </div>
                ))}
              </div>
              {guide.imageNote && <figcaption className="mt-1 text-sm text-muted">ℹ️ {guide.imageNote}</figcaption>}
            </figure>
          )}
          <a
            href={youtubeSearch(guide.video)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium"
          >
            ▶ Buscar videos en YouTube
          </a>
        </div>
      )}
    </div>
  )
}
