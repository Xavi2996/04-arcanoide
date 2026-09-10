const canvas = document.getElementById( 'game' );
const ctx = canvas.getContext( '2d' );

const GRID = { rows: 5, cols: 8 };
const ROW_COLORS = [ 'red', 'yellow', 'green', 'cyan', 'magenta' ];
const POINTS_PER_BLOCK = 10;

const state = {
  screen: 'start', // 'start' | 'playing' | 'paused' | 'win' | 'gameover'
  score: 0,
  lives: 3,
  paddle: { x: 319, y: 570, width: 162, height: 14, speed: 7 },
  ball: { x: 400, y: 560, radius: 8, dx: 4, dy: -4, speed: 5 },
  blocks: [],
};

const SCREEN_MESSAGES = {
  start: 'Arkanoid — pulsa una tecla para empezar',
  playing: 'Jugando',
  paused: 'Pausa',
  win: '¡Victoria!',
  gameover: 'Game Over',
};

const ballBounceSound = new Audio( 'assets/sounds/ball-bounce.mp3' );

function playSound( audio ) {
  audio.cloneNode().play();
}

const keys = { left: false, right: false };

window.addEventListener( 'keydown', ( e ) => {
  if ( e.key === 'ArrowLeft' ) keys.left = true;
  if ( e.key === 'ArrowRight' ) keys.right = true;
} );

window.addEventListener( 'keyup', ( e ) => {
  if ( e.key === 'ArrowLeft' ) keys.left = false;
  if ( e.key === 'ArrowRight' ) keys.right = false;
} );

function updatePaddle() {
  const p = state.paddle;
  if ( keys.left ) p.x -= p.speed;
  if ( keys.right ) p.x += p.speed;

  if ( p.x < 0 ) p.x = 0;
  if ( p.x + p.width > canvas.width ) p.x = canvas.width - p.width;
}

function updateBall() {
  const b = state.ball;
  b.x += b.dx;
  b.y += b.dy;

  if ( b.x - b.radius < 0 ) {
    b.x = b.radius;
    b.dx = -b.dx;
    playSound( ballBounceSound );
  } else if ( b.x + b.radius > canvas.width ) {
    b.x = canvas.width - b.radius;
    b.dx = -b.dx;
    playSound( ballBounceSound );
  }

  if ( b.y - b.radius < 0 ) {
    b.y = b.radius;
    b.dy = -b.dy;
    playSound( ballBounceSound );
  }
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect( 0, 0, canvas.width, canvas.height );

  drawSprite( ctx, 'paddle', state.paddle.x, state.paddle.y, state.paddle.width, state.paddle.height );

  const b = state.ball;
  drawSprite( ctx, 'ball', b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2 );

  ctx.fillStyle = '#fff';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText( SCREEN_MESSAGES[ state.screen ], canvas.width / 2, canvas.height / 2 );
}

function update() {
  updatePaddle();
  updateBall();
}

function loop() {
  update();
  draw();
  requestAnimationFrame( loop );
}

loadSpritesheet( () => requestAnimationFrame( loop ) );
