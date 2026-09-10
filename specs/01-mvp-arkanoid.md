# SPEC 01 — MVP jugable de Arkanoid

> **Estado:** aprobado
> **Depende de:** Ninguna
> **Fecha:** 2026-09-10
> **Objetivo:** Construir un MVP jugable de Arkanoid de un solo nivel, con paleta controlada por teclado, sistema de vidas, puntaje y sonido, sin persistencia entre sesiones.

## Alcance

**Incluye:**

- `index.html` con un `<canvas>` de 800x600px centrado en la página, `style.css` y `game.js` en la raíz del proyecto, reutilizando `assets/spritesheet.js` sin modificarlo.
- Pantalla de inicio con una acción (tecla o clic) para comenzar la partida.
- Paleta controlada con las flechas ← → del teclado, usando el sprite `paddle` (162x14px).
- Pelota (`ball`, 16x16px) que rebota contra paredes, paleta y bloques. El ángulo de rebote contra la paleta depende del punto de impacto (más inclinado cerca de los bordes, casi vertical en el centro).
- Cuadrícula de bloques fija de 8 columnas x 5 filas (40 bloques), usando los sprites de `SPRITES.blocks`, con un color distinto por fila (variedad visual, sin efecto en el puntaje).
- Sistema de vidas: el jugador comienza con 3 vidas; pierde una cada vez que la pelota cae por debajo de la paleta. Al llegar a 0 vidas termina la partida (derrota).
- Puntaje: romper un bloque = +10 puntos, igual para todos los colores. Se muestra en pantalla durante la partida.
- Condición de victoria: romper los 40 bloques del nivel.
- Pantalla de fin de partida (victoria o derrota) con opción de reiniciar sin recargar la página.
- Pausa con la tecla Esc: detiene la actualización del loop y muestra un overlay; se reanuda con la misma tecla.
- Sonido: `assets/sounds/ball-bounce.mp3` al rebotar la pelota (paredes y paleta), `assets/sounds/break-sound.mp3` al romper un bloque, reutilizando la animación de explosión (`EXPLOSION_FRAMES`) ya definida en `spritesheet.js`.

**Fuera de alcance (para specs futuras):**

- Persistencia de puntaje más alto (localStorage u otro medio).
- Múltiples niveles o progresión entre niveles.
- Power-ups o efectos especiales sobre bloques.
- Soporte de controles por mouse o táctil.
- Canvas responsive/adaptable al tamaño de ventana.
- Control de volumen o silenciar sonido.

## Modelo de datos

```js
// Estado del juego, vive en memoria (sin persistencia)
const state = {
  screen: "start", // 'start' | 'playing' | 'paused' | 'win' | 'gameover'
  score: 0,
  lives: 3,
  paddle: { x: 319, y: 570, width: 162, height: 14, speed: 7 }, // px/frame
  ball: { x: 400, y: 560, radius: 8, dx: 4, dy: -4, speed: 5 }, // px/frame
  blocks: [
    // { x, y, width: 32, height: 16, color: 'red', alive: true }
  ],
};
```

Convenciones:

- Origen de coordenadas: esquina superior izquierda del canvas.
- Velocidades expresadas en píxeles por frame (loop basado en `requestAnimationFrame`).
- `blocks` se genera al iniciar la partida a partir de una constante `GRID = { rows: 5, cols: 8 }` y un arreglo `ROW_COLORS` (ej. `['red', 'yellow', 'green', 'cyan', 'magenta']`) que asigna un color por fila.
- Puntaje por bloque: constante única `POINTS_PER_BLOCK = 10`, independiente del color.

## Plan de implementación

1. Crear `index.html` con el `<canvas>` de 800x600, enlazando `style.css`, `assets/spritesheet.js` y `game.js`. Dibujar un fondo simple para confirmar que el canvas renderiza.
2. En `game.js`, implementar el loop principal (`requestAnimationFrame`) y la máquina de estados de pantallas (`start`, `playing`, `paused`, `win`, `gameover`), dibujando solo un mensaje distinto según `state.screen`.
3. Implementar la paleta: dibujo con `drawSprite`, movimiento con flechas ← →, límites del canvas.
4. Implementar la pelota: dibujo, movimiento, rebote contra paredes (izquierda, derecha, arriba) y sonido `ball-bounce.mp3`.
5. Implementar la colisión pelota-paleta con ángulo de rebote según el punto de impacto.
6. Generar la cuadrícula de bloques (`GRID`, `ROW_COLORS`) y dibujarla con `drawSprite`.
7. Implementar la colisión pelota-bloque: eliminar el bloque golpeado, sumar `POINTS_PER_BLOCK`, reproducir `break-sound.mp3` y mostrar la animación de explosión del color correspondiente.
8. Implementar la pérdida de vida (pelota cae debajo de la paleta): decrementar `state.lives`, reiniciar posición de pelota/paleta, o pasar a `gameover` si `lives` llega a 0.
9. Implementar la condición de victoria (todos los bloques con `alive: false`) pasando a `screen: 'win'`.
10. Implementar la pantalla de inicio (`start`) y la de fin (`win`/`gameover`) con opción de reiniciar (reinicia `state` sin recargar la página).
11. Implementar la pausa con Esc: alterna entre `playing` y `paused`, deteniendo la actualización del loop mientras se muestra un overlay.

Cada paso deja el juego en un estado ejecutable, probable abriendo `index.html` directamente en el navegador.

## Criterios de aceptación

- [ ] Abrir `index.html` directamente en el navegador (sin servidor) carga el juego sin errores en la consola.
- [ ] En la pantalla de inicio, una acción del jugador (tecla o clic) comienza la partida.
- [ ] Las flechas ← → mueven la paleta sin salirse de los límites del canvas.
- [ ] La pelota rebota contra las paredes y la paleta; el ángulo de rebote contra la paleta cambia según el punto de impacto.
- [ ] Romper un bloque lo elimina, suma exactamente 10 puntos y reproduce `break-sound.mp3`.
- [ ] Cada rebote de la pelota contra pared o paleta reproduce `ball-bounce.mp3`.
- [ ] El puntaje visible en pantalla se actualiza en tiempo real.
- [ ] Perder las 3 vidas (la pelota cae 3 veces) muestra la pantalla de derrota.
- [ ] Romper los 40 bloques muestra la pantalla de victoria.
- [ ] Presionar Esc durante la partida la pausa (deja de actualizarse) y volver a presionarlo la reanuda.
- [ ] La pantalla de fin (victoria o derrota) permite reiniciar la partida sin recargar la página.
- [ ] Recargar la página siempre vuelve a la pantalla de inicio con puntaje y vidas reiniciados (no hay persistencia).

## Decisiones tomadas y descartadas

- **Sí:** un solo nivel fijo (8x5 bloques). Alcanza para un MVP jugable de principio a fin sin la complejidad de progresión entre niveles.
- **No:** múltiples niveles. Se deja para una spec futura de "niveles y progresión".
- **Sí:** control solo por teclado (flechas ← →). Es la opción más simple y sin lógica adicional de mouse.
- **No:** soporte de mouse/táctil en este MVP. Se puede añadir después sin romper la arquitectura del loop.
- **Sí:** puntaje fijo por bloque (10 pts), independiente del color. Evita definir una tabla de puntajes sin un caso de uso claro todavía.
- **No:** puntaje variable por color. Queda como posible mejora futura.
- **Sí:** sin persistencia de high score. Reduce el alcance del MVP; se puede agregar como spec incremental (localStorage, versión de esquema, etc.).
- **No:** localStorage en este MVP.
- **Sí:** canvas de tamaño fijo (800x600). Simplifica los cálculos de colisión.
- **No:** canvas responsive. Se evalúa en una spec futura si se necesita soporte móvil.
- **Sí:** ángulo de rebote en la paleta según el punto de impacto. Es la mecánica que hace jugable y controlable el Arkanoid; un rebote fijo se siente plano.
- **Sí:** reutilizar `assets/spritesheet.js` tal cual, sin modificarlo, para dibujar paleta, pelota, bloques y explosiones.

## Lo que **no** está en esta spec

- Persistencia de puntaje más alto.
- Múltiples niveles o progresión.
- Power-ups.
- Controles por mouse o táctil.
- Canvas responsive.
- Control de volumen/silencio de audio.

Cada uno de estos, si se implementa, va en su propia spec.
