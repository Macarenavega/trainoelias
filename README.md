# Trainoelias

App para seguir la rutina de calistenia, piernas, escalada y movilidad. Tiene dos programas:

- **Mes 2 (en uso)**: semana tipo v3, 5 días: hipertrofia de pierna + muscle-up + split + movilidad.
- **Mes 1**: 6 días: calistenia progresiva + piernas + escalada + movilidad.

El programa se elige en Ajustes. Cambiar de programa no borra el historial, y los ejercicios que se repiten conservan la última marca.

Se instala en el celular como una app (PWA) y guarda todo en el propio dispositivo, sin cuenta ni servidor.

## Qué hace

- **Hoy**: muestra la sesión que toca según el día (Lunes a Jueves gimnasio, Viernes y Sábado en casa, Domingo descanso). Se puede elegir otra sesión.
- **Elegir días**: en la tarjeta "Semana" se eligen los días de esta semana o la próxima; Día 1 a Día 6 se reparten en orden.
- **Alternativas (opcional)**: la rutina original es la prioridad. Si falta el material o está ocupado, cada ejercicio con alternativas tiene un enlace discreto para cambiarlo solo por esa sesión (o siempre, si se marca a propósito; se deshace en Ajustes).
- **Modo entrenamiento**: calentamiento, series con repeticiones/segundos/minutos y **kg** en los ejercicios con carga. El peso de la última vez se rellena solo.
- **Última vez**: cada ejercicio muestra lo que se hizo en la sesión anterior, para progresar la carga.
- **Bloques cronometrados**: AMRAP, EMOM (aviso cada minuto) y Tabata 20"/20" (aviso en cada cambio).
- **Alternancia semanal**: en el Día 4, la app indica si esta semana toca Pike push up o Push up explosivo.
- **Cómo se hace**: explicación breve paso a paso, imágenes de referencia cuando hay y búsqueda de videos en YouTube.
- **Historial**, récords del plan y respaldo/restauración de datos.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # compilación de producción
npm run lint
```

Hecho con React + TypeScript + Vite + Tailwind CSS. La rutina (los dos programas) está en `src/data/routine.ts`.

## Publicación

Cada push a `main` publica la app en GitHub Pages (`.github/workflows/deploy.yml`).

## Créditos

Imágenes de ejercicios de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (dominio público, Unlicense), en `public/exercises/`.
