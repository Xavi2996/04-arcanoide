# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

Juego de Arkanoid/Breakout en HTML, CSS y JavaScript **sin dependencias** (sin frameworks, sin bundler, sin `package.json`). Cualquier persona debe poder abrir `index.html` directamente en el navegador y jugarlo, sin servidor ni build.

**Estado actual: MVP jugable implementado** (ver `specs/01-mvp-arkanoid.md` y `specs/02-duracion-explosion-bloques.md`). No hay comandos de build, lint o test porque no hay tooling que los requiera; si en el futuro se añade un `package.json`, actualiza esta sección.

## Estructura del proyecto

- `index.html`: un único `<canvas id="game">` de 800x600, más los `<script>` de `assets/spritesheet.js` y `game.js` (en ese orden, sin módulos ES ni bundler).
- `style.css`: estilos mínimos, solo centra el canvas en la página.
- `game.js`: todo el código del juego (estado, loop, input, colisiones, dibujo). Es un único archivo, sin funciones exportadas ni imports — todo vive en el scope global del script.
- `assets/`: sprites y sonidos, ver sección siguiente.
- `specs/`: specs del flujo spec-driven (ver más abajo).

## Patrones del código del juego (`game.js`)

- **Estado centralizado:** un único objeto `state` (screen, score, lives, paddle, ball, blocks) que se muta directamente entre frames. `state.screen` es una máquina de estados por string (`'start' | 'playing' | 'paused' | 'win' | 'gameover'`); cada pantalla nueva se agrega como un valor más de ese enum y una entrada en `SCREEN_MESSAGES`.
- **Loop principal:** `requestAnimationFrame` llamando `update()` → `draw()`. `update()` hace no-op salvo que `state.screen === 'playing'`; el dibujo (`draw()`) sí corre siempre para poder mostrar overlays de pausa/inicio/fin.
- **Constantes de configuración arriba del archivo:** valores ajustables del juego (`GRID`, `ROW_COLORS`, `POINTS_PER_BLOCK`, `BLOCK_WIDTH/HEIGHT/PADDING`, `BLOCKS_TOP`, `MAX_BOUNCE_ANGLE`, `BLOCK_EXPLOSION_DURATION`) se declaran como constantes en mayúsculas al inicio de `game.js`, nunca hardcodeadas dentro de las funciones.
- **No modificar `assets/spritesheet.js`:** si una constante ya definida ahí (ej. `EXPLOSION_DURATION`) necesita otro valor para el juego, se define una constante propia en `game.js` (ej. `BLOCK_EXPLOSION_DURATION`) y se usa esa en su lugar, en vez de editar el asset compartido.
- **Efectos transitorios (explosiones):** un array (`explosions`) de objetos `{ x, y, width, height, color, startTime }`; se agregan al ocurrir el evento y se limpian cada frame (`updateExplosions()`) comparando `performance.now() - startTime` contra una duración. El frame de animación a dibujar se calcula como `Math.floor((now - startTime) / (duración / frames.length))`. Este es el patrón a seguir para cualquier otro efecto visual con vida corta.
- **Sonido:** un `new Audio(...)` por efecto, creado una sola vez arriba del archivo, reproducido con el helper `playSound(audio)` que hace `audio.cloneNode().play()` — así los sonidos pueden solaparse si el evento ocurre varias veces seguidas (ej. romper dos bloques casi al mismo tiempo).
- **Colisiones:** helper genérico `circleRectOverlap(cx, cy, radius, rect)` para pelota-vs-rectángulo (paleta o bloque); el eje de rebote se decide comparando los cuatro solapamientos (`overlapLeft/Right/Top/Bottom`) y tomando el mínimo.
- **Reinicio de partida:** `restartGame()` resetea `score`, `lives`, `blocks` y limpia `explosions`, luego llama `resetBallAndPaddle()`. Cualquier nuevo estado transitorio (arrays de efectos, timers, etc.) debe limpiarse también ahí.
- **Dibujo de sprites:** siempre vía `drawSprite(ctx, name, x, y, w, h)` / `drawFrame(ctx, frame, x, y, w, h)` de `spritesheet.js`. Los bloques se referencian como `block_<color>` (ej. `block_red`), nunca accediendo a `SPRITES` directamente desde `game.js`.

## Assets disponibles

- `assets/spritesheet-breakout.png` + `assets/spritesheet.js`: carga el spritesheet de forma asíncrona (dibujándolo en un canvas offscreen) y expone `loadSpritesheet(cb)`, `drawSprite(ctx, name, x, y, w, h)` y `drawFrame(ctx, frame, x, y, w, h)`. Los sprites están indexados por nombre en el objeto `SPRITES` (`paddle`, `ball`, `blocks.<color>`); los bloques se referencian como `block_<color>` (ej. `block_red`). Las animaciones de explosión por color están en `EXPLOSION_FRAMES`, con `EXPLOSION_DURATION` en ms (nota: `game.js` no usa esta constante directamente, ver `BLOCK_EXPLOSION_DURATION` arriba).
- `assets/sounds/ball-bounce.mp3` y `assets/sounds/break-sound.mp3`: efectos de sonido del rebote de la pelota y de la rotura de bloques.

Cualquier implementación del juego debe reutilizar `spritesheet.js` tal cual en vez de reescribir la lógica de sprites.

## Flujo de trabajo: specs

Este repo usa un flujo spec-driven mediante skills personalizadas instaladas vía `skills-lock.json` (fuente: `Klerith/fernando-skills`), presentes tanto en `.claude/skills/` como en `.agents/skills/`:

- **`/spec`**: diseña una spec haciendo preguntas de clarificación antes de escribir nada. Guarda el resultado en `specs/NN-slug.md` con estado inicial `Draft`/`Borrador`. Nunca escribe código.
- **`/spec-impl NN-slug`**: solo avanza si el estado de la spec significa "Aprobado"/"Approved". Si es así, crea (o reutiliza) la rama `spec-NN-slug` y luego implementa el plan paso a paso, pausando tras cada paso para revisión. Nunca commitea automáticamente.

Antes de implementar cualquier feature de tamaño medio o grande, sigue este flujo (`/spec` → revisión humana → `/spec-impl`) en vez de escribir código directamente, salvo que el usuario pida explícitamente saltárselo.

Specs existentes: `specs/01-mvp-arkanoid.md` (MVP base) y `specs/02-duracion-explosion-bloques.md` (ajuste de duración de la animación de explosión). Cada spec nueva se numera secuencialmente y documenta explícitamente qué queda fuera de su alcance para no filtrarse al implementarla.
