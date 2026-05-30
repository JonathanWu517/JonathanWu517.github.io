<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Muted rose palette
const COLORS = ['#d4b8c2', '#c9a8b4', '#dcc4cd', '#c0909f', '#dbc0c8', '#cea8b5', '#d8c0c8']
const MAX_PETALS = 25
const MIN_PETALS = 15

interface Petal {
  x: number
  y: number
  size: number
  speed: number
  swayAmp: number
  swaySpeed: number
  phase: number
  rotation: number
  rotationSpeed: number
  opacity: number
  color: string
  vx: number
  vy: number
  bursting: boolean
}

let petals: Petal[] = []
let animId = 0
let ctx: CanvasRenderingContext2D | null = null
let W = 0
let H = 0

function random(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function createPetal(yOffset = 0): Petal {
  return {
    x: random(0, W),
    y: yOffset || random(-H, 0),
    size: random(8, 20),
    speed: random(0.3, 1.2),
    swayAmp: random(20, 60),
    swaySpeed: random(0.006, 0.02),
    phase: random(0, Math.PI * 2),
    rotation: random(0, Math.PI * 2),
    rotationSpeed: random(-0.012, 0.012),
    opacity: random(0.25, 0.55),
    color: COLORS[Math.floor(random(0, COLORS.length))],
    vx: 0,
    vy: 0,
    bursting: false
  }
}

function drawPetal(p: Petal) {
  if (!ctx) return
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.globalAlpha = p.opacity
  ctx.fillStyle = p.color

  const s = p.size
  ctx.beginPath()
  ctx.moveTo(0, -s * 0.5)
  ctx.bezierCurveTo(s * 0.35, -s * 0.15, s * 0.35, s * 0.15, 0, s * 0.5)
  ctx.bezierCurveTo(-s * 0.35, s * 0.15, -s * 0.35, -s * 0.15, 0, -s * 0.5)
  ctx.fill()

  ctx.restore()
}

function spawnBurst(x: number, y: number) {
  const count = Math.floor(random(6, 11))
  for (let i = 0; i < count; i++) {
    const angle = random(0, Math.PI * 2)
    const force = random(2, 6)
    const petal: Petal = {
      x,
      y,
      size: random(6, 14),
      speed: random(0.2, 0.8),
      swayAmp: random(15, 45),
      swaySpeed: random(0.01, 0.03),
      phase: random(0, Math.PI * 2),
      rotation: random(0, Math.PI * 2),
      rotationSpeed: random(-0.04, 0.04),
      opacity: random(0.4, 0.75),
      color: COLORS[Math.floor(random(0, COLORS.length))],
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force - 2,
      bursting: true
    }
    petals.push(petal)
    if (petals.length > 60) petals.shift()
  }
}

function resize() {
  if (!canvasRef.value) return
  W = window.innerWidth
  H = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvasRef.value.width = W * dpr
  canvasRef.value.height = H * dpr
  canvasRef.value.style.width = W + 'px'
  canvasRef.value.style.height = H + 'px'
  ctx = canvasRef.value.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function animate() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)

  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i]

    if (p.bursting) {
      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.95
      p.vy *= 0.95
      p.vy += 0.05
      if (Math.abs(p.vx) < 0.1 && Math.abs(p.vy) < 0.25) {
        p.bursting = false
        p.speed = random(0.2, 0.8)
      }
    } else {
      p.y += p.speed
      p.x += Math.sin(p.phase) * p.swayAmp * 0.02
    }

    p.phase += p.swaySpeed
    p.rotation += p.rotationSpeed

    drawPetal(p)

    if (p.y > H + 40) {
      petals.splice(i, 1)
    }
  }

  while (petals.length < MIN_PETALS) {
    petals.push(createPetal(-40))
  }

  animId = requestAnimationFrame(animate)
}

function onClick(e: MouseEvent) {
  spawnBurst(e.clientX, e.clientY)
}

onMounted(() => {
  resize()
  for (let i = 0; i < MAX_PETALS; i++) {
    petals.push(createPetal(random(-H, H)))
  }
  animate()
  window.addEventListener('resize', resize)
  window.addEventListener('click', onClick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('click', onClick)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="sakura-canvas"
    aria-hidden="true"
  />
</template>

<style scoped>
.sakura-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}
</style>
