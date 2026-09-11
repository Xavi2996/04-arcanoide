# SPEC 02 — Duración de la animación de explosión de bloques

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-09-10
> **Objetivo:** Alargar la duración de la animación de explosión al destruir un bloque, de 150ms a 350ms, sin modificar `assets/spritesheet.js`.

## Alcance

**Incluye:**

- Aumentar la duración visible de la animación de explosión de bloques (ya implementada en `game.js` reutilizando `EXPLOSION_FRAMES` de `spritesheet.js`) de 150ms a 350ms.
- Definir la nueva duración como constante en `game.js`, no en `assets/spritesheet.js`, respetando la convención del proyecto de reutilizar ese archivo tal cual.
- Mantener los mismos 4 frames por color ya existentes en `EXPLOSION_FRAMES`; solo cambia el tiempo total de reproducción y, por lo tanto, el tiempo que se muestra cada frame.

**Fuera de alcance (para specs futuras):**

- Nuevos efectos visuales (fade-out, escalado, screen shake, partículas propias fuera del spritesheet).
- Cambios al sonido `break-sound.mp3` o a su comportamiento cuando se rompen varios bloques casi simultáneamente.
- Cambios a la lógica de puntaje, colisión, o a la desaparición instantánea del sprite del bloque golpeado.
- Modificar `assets/spritesheet.js`.

## Modelo de datos

```js
// game.js
const BLOCK_EXPLOSION_DURATION = 350; // ms — reemplaza el uso directo de EXPLOSION_DURATION (definida en spritesheet.js) para no modificar ese archivo
```

Convenciones:

- Los 4 frames de `EXPLOSION_FRAMES` (definidos en `spritesheet.js`) no cambian; solo cambia cuánto tiempo se muestra cada uno (`frameDuration = BLOCK_EXPLOSION_DURATION / frames.length`).
- `assets/spritesheet.js` permanece sin modificar, tal como establece SPEC 01.

## Plan de implementación

1. En `game.js`, agregar la constante `BLOCK_EXPLOSION_DURATION = 350` junto a la declaración del array `explosions`, y reemplazar las dos referencias a `EXPLOSION_DURATION` (en `updateExplosions()` para la condición de expiración, y en `draw()` para el cálculo de `frameDuration`) por `BLOCK_EXPLOSION_DURATION`.
2. Verificar manualmente abriendo `index.html` en el navegador: romper un bloque y confirmar que la animación de explosión se percibe más larga que antes (350ms vs 150ms), sin errores en consola.

Cada paso deja el juego en un estado ejecutable, probable abriendo `index.html` directamente en el navegador.

## Criterios de aceptación

- [ ] `game.js` define la constante `BLOCK_EXPLOSION_DURATION` con valor `350`.
- [ ] `assets/spritesheet.js` no se modifica (contenido idéntico al de antes de esta spec).
- [ ] Al romper un bloque en el navegador, la animación de explosión se percibe visiblemente más larga que antes del cambio (aprox. 350ms en vez de 150ms).
- [ ] Los 4 frames de `EXPLOSION_FRAMES` del color correspondiente se siguen mostrando en orden, sin saltos ni errores en consola.
- [ ] El resto del comportamiento de destrucción de bloques (puntaje +10, sonido `break-sound.mp3`, desaparición instantánea del sprite del bloque) no cambia.

## Decisiones tomadas y descartadas

- **Sí:** alargar la duración a 350ms. Es el punto medio del rango solicitado (300-400ms) y da tiempo suficiente para percibir los 4 frames sin frenar el ritmo del juego.
- **No:** 300ms o 400ms como valores finales. Se descartan a favor de 350ms, el punto medio elegido explícitamente.
- **Sí:** definir la nueva duración como constante local en `game.js` (`BLOCK_EXPLOSION_DURATION`) en vez de modificar `EXPLOSION_DURATION` en `assets/spritesheet.js`. Respeta la convención del proyecto (CLAUDE.md y SPEC 01) de reutilizar `spritesheet.js` tal cual, sin modificarlo.
- **No:** modificar `assets/spritesheet.js` directamente. Rompería esa convención ya establecida.
- **No:** agregar efectos visuales nuevos (fade-out, escalado, screen shake, partículas propias). Descartados explícitamente por el usuario; quedan disponibles para una spec futura si se desean.
- **No:** cambios al sonido, al puntaje o a la lógica de colisión. El usuario confirmó que el ajuste es solo sobre la animación visual.

## Lo que **no** está en esta spec

- Nuevos efectos visuales (fade-out, escalado, screen shake, partículas propias).
- Cambios al sonido de rotura de bloques o a su comportamiento al solaparse.
- Cambios a la lógica de puntaje, colisión o desaparición del sprite del bloque.
- Modificación de `assets/spritesheet.js`.

Cada uno de estos, si se implementa, va en su propia spec.
