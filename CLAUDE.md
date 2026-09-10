# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

Juego de Arkanoid/Breakout en HTML, CSS y JavaScript **sin dependencias** (sin frameworks, sin bundler, sin `package.json`). Cualquier persona debe poder abrir el juego y jugarlo directamente.

**Estado actual: no implementado.** El repositorio solo contiene los assets del juego y el scaffolding del flujo de trabajo basado en specs — todavía no existe `index.html` ni código del juego. No hay comandos de build, lint o test porque no hay código ni tooling que los requiera; si en el futuro se añade un `package.json`, actualiza esta sección.

Nota: este directorio **no es un repositorio git todavía** (`git init` no se ha ejecutado). El comando `/spec-impl` asume git para crear ramas (`spec-NN-slug`), así que antes de usarlo hay que inicializar el repo.

## Assets disponibles

- `assets/spritesheet-breakout.png` + `assets/spritesheet.js`: carga el spritesheet de forma asíncrona (dibujándolo en un canvas offscreen) y expone `loadSpritesheet(cb)`, `drawSprite(ctx, name, x, y, w, h)` y `drawFrame(ctx, frame, x, y, w, h)`. Los sprites están indexados por nombre en el objeto `SPRITES` (`paddle`, `ball`, `blocks.<color>`); los bloques se referencian como `block_<color>` (ej. `block_red`). Las animaciones de explosión por color están en `EXPLOSION_FRAMES`, con `EXPLOSION_DURATION` en ms.
- `assets/sounds/ball-bounce.mp3` y `assets/sounds/break-sound.mp3`: efectos de sonido del rebote de la pelota y de la rotura de bloques.

Cualquier implementación del juego debe reutilizar `spritesheet.js` tal cual en vez de reescribir la lógica de sprites.

## Flujo de trabajo: specs

Este repo usa un flujo spec-driven mediante skills personalizadas instaladas vía `skills-lock.json` (fuente: `Klerith/fernando-skills`), presentes tanto en `.claude/skills/` como en `.agents/skills/`:

- **`/spec`**: diseña una spec haciendo preguntas de clarificación antes de escribir nada. Guarda el resultado en `specs/NN-slug.md` (carpeta que aún no existe) con estado inicial `Draft`/`Borrador`. Nunca escribe código.
- **`/spec-impl NN-slug`**: solo avanza si el estado de la spec significa "Aprobado"/"Approved". Si es así, crea (o reutiliza) la rama `spec-NN-slug` y luego implementa el plan paso a paso, pausando tras cada paso para revisión. Nunca commitea automáticamente.

Antes de implementar cualquier feature de tamaño medio o grande, sigue este flujo (`/spec` → revisión humana → `/spec-impl`) en vez de escribir código directamente, salvo que el usuario pida explícitamente saltárselo.
