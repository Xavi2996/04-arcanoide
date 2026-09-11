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

const BLOCK_WIDTH = 32;
const BLOCK_HEIGHT = 16;
const BLOCK_PADDING = 4;
const BLOCKS_TOP = 50;

function createBlocks() {
  const blocks = [];
  const gridWidth = GRID.cols * BLOCK_WIDTH + ( GRID.cols - 1 ) * BLOCK_PADDING;
  const offsetLeft = ( canvas.width - gridWidth ) / 2;

  for ( let row = 0; row < GRID.rows; row++ ) {
    for ( let col = 0; col < GRID.cols; col++ ) {
      blocks.push( {
        x: offsetLeft + col * ( BLOCK_WIDTH + BLOCK_PADDING ),
        y: BLOCKS_TOP + row * ( BLOCK_HEIGHT + BLOCK_PADDING ),
        width: BLOCK_WIDTH,
        height: BLOCK_HEIGHT,
        color: ROW_COLORS[ row ],
        alive: true,
      } );
    }
  }

  return blocks;
}

state.blocks = createBlocks();

const SCREEN_MESSAGES = {
  start: 'Arkanoid — pulsa una tecla o clic para empezar',
  playing: '',
  paused: 'Pausa',
  win: '¡Victoria! — pulsa una tecla o clic para reiniciar',
  gameover: 'Game Over — pulsa una tecla o clic para reiniciar',
};

const ballBounceSound = new Audio( 'assets/sounds/ball-bounce.mp3' );
const breakSound = new Audio( 'assets/sounds/break-sound.mp3' );

function playSound( audio ) {
  audio.cloneNode().play();
}

const explosions = []; // { x, y, width, height, color, startTime }
const BLOCK_EXPLOSION_DURATION = 350; // ms — reemplaza EXPLOSION_DURATION (definida en spritesheet.js) para no modificar ese archivo

const keys = { left: false, right: false };

window.addEventListener( 'keydown', ( e ) => {
  if ( e.key === 'ArrowLeft' ) keys.left = true;
  if ( e.key === 'ArrowRight' ) keys.right = true;

  if ( e.key === 'Escape' ) {
    togglePause();
    return;
  }

  handleAction();
} );

window.addEventListener( 'keyup', ( e ) => {
  if ( e.key === 'ArrowLeft' ) keys.left = false;
  if ( e.key === 'ArrowRight' ) keys.right = false;
} );

canvas.addEventListener( 'click', handleAction );

function togglePause() {
  if ( state.screen === 'playing' ) {
    state.screen = 'paused';
  } else if ( state.screen === 'paused' ) {
    state.screen = 'playing';
  }
}

function handleAction() {
  if ( state.screen === 'start' ) {
    state.screen = 'playing';
  } else if ( state.screen === 'win' || state.screen === 'gameover' ) {
    restartGame();
  }
}

function restartGame() {
  state.score = 0;
  state.lives = 3;
  state.blocks = createBlocks();
  explosions.length = 0;
  resetBallAndPaddle();
  state.screen = 'playing';
}

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

  checkPaddleCollision();
  checkBlockCollision();
  checkBallLost();
}

function resetBallAndPaddle() {
  state.ball.x = 400;
  state.ball.y = 560;
  state.ball.dx = 4;
  state.ball.dy = -4;
  state.paddle.x = 319;
}

function checkBallLost() {
  const b = state.ball;
  if ( b.y - b.radius <= canvas.height ) return;

  state.lives -= 1;

  if ( state.lives <= 0 ) {
    state.screen = 'gameover';
  } else {
    resetBallAndPaddle();
  }
}

function circleRectOverlap( cx, cy, radius, rect ) {
  const closestX = Math.max( rect.x, Math.min( cx, rect.x + rect.width ) );
  const closestY = Math.max( rect.y, Math.min( cy, rect.y + rect.height ) );
  const dx = cx - closestX;
  const dy = cy - closestY;
  return ( dx * dx + dy * dy ) < ( radius * radius );
}

function checkBlockCollision() {
  const b = state.ball;

  for ( const block of state.blocks ) {
    if ( !block.alive ) continue;
    if ( !circleRectOverlap( b.x, b.y, b.radius, block ) ) continue;

    const overlapLeft = ( b.x + b.radius ) - block.x;
    const overlapRight = ( block.x + block.width ) - ( b.x - b.radius );
    const overlapTop = ( b.y + b.radius ) - block.y;
    const overlapBottom = ( block.y + block.height ) - ( b.y - b.radius );
    const minOverlap = Math.min( overlapLeft, overlapRight, overlapTop, overlapBottom );

    if ( minOverlap === overlapTop || minOverlap === overlapBottom ) {
      b.dy = -b.dy;
    } else {
      b.dx = -b.dx;
    }

    block.alive = false;
    state.score += POINTS_PER_BLOCK;

    explosions.push( {
      x: block.x,
      y: block.y,
      width: block.width,
      height: block.height,
      color: block.color,
      startTime: performance.now(),
    } );

    playSound( breakSound );
    checkWinCondition();
    break;
  }
}

function checkWinCondition() {
  const allBlocksDestroyed = state.blocks.every( ( block ) => !block.alive );
  if ( allBlocksDestroyed ) {
    state.screen = 'win';
  }
}

function updateExplosions() {
  const now = performance.now();
  for ( let i = explosions.length - 1; i >= 0; i-- ) {
    if ( now - explosions[ i ].startTime >= BLOCK_EXPLOSION_DURATION ) {
      explosions.splice( i, 1 );
    }
  }
}

const MAX_BOUNCE_ANGLE = ( 75 * Math.PI ) / 180;

function checkPaddleCollision() {
  const b = state.ball;
  const p = state.paddle;

  const hitsPaddle = b.dy > 0 &&
    b.y + b.radius >= p.y &&
    b.y + b.radius <= p.y + p.height &&
    b.x + b.radius >= p.x &&
    b.x - b.radius <= p.x + p.width;

  if ( !hitsPaddle ) return;

  const paddleCenter = p.x + p.width / 2;
  const relativeImpact = ( b.x - paddleCenter ) / ( p.width / 2 ); // -1 .. 1
  const clamped = Math.max( -1, Math.min( 1, relativeImpact ) );
  const angle = clamped * MAX_BOUNCE_ANGLE;

  b.dx = b.speed * Math.sin( angle );
  b.dy = -b.speed * Math.cos( angle );
  b.y = p.y - b.radius;

  playSound( ballBounceSound );
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect( 0, 0, canvas.width, canvas.height );

  drawSprite( ctx, 'paddle', state.paddle.x, state.paddle.y, state.paddle.width, state.paddle.height );

  for ( const block of state.blocks ) {
    if ( !block.alive ) continue;
    drawSprite( ctx, `block_${ block.color }`, block.x, block.y, block.width, block.height );
  }

  const b = state.ball;
  drawSprite( ctx, 'ball', b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2 );

  const now = performance.now();
  for ( const explosion of explosions ) {
    const frames = EXPLOSION_FRAMES[ explosion.color ];
    const frameDuration = BLOCK_EXPLOSION_DURATION / frames.length;
    const frameIndex = Math.min( frames.length - 1, Math.floor( ( now - explosion.startTime ) / frameDuration ) );
    drawFrame( ctx, frames[ frameIndex ], explosion.x, explosion.y, explosion.width, explosion.height );
  }

  ctx.fillStyle = '#fff';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText( `Puntaje: ${ state.score }`, 10, 20 );
  ctx.textAlign = 'right';
  ctx.fillText( `Vidas: ${ state.lives }`, canvas.width - 10, 20 );

  if ( state.screen === 'paused' ) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect( 0, 0, canvas.width, canvas.height );
    ctx.fillStyle = '#fff';
  }

  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText( SCREEN_MESSAGES[ state.screen ], canvas.width / 2, canvas.height / 2 );
}

function update() {
  if ( state.screen !== 'playing' ) return;

  updatePaddle();
  updateBall();
  updateExplosions();
}

function loop() {
  update();
  draw();
  requestAnimationFrame( loop );
}

loadSpritesheet( () => requestAnimationFrame( loop ) );
