/**
 * interaction.js — User input: tap-to-open, runaway "No" button, "Yes" celebration.
 */
import * as THREE from 'three';
import { camera, renderer } from './scene.js';
import { locketGroup, modelReady, setTargetOpen, getTargetOpen } from './locket.js';
import { CELEBRATION_TEXT, TAP_THRESHOLD_PX } from './config.js';

// ── Tap-to-toggle locket ────────────────────────────────────
const raycaster = new THREE.Raycaster();
const pointer   = new THREE.Vector2();
const instructionEl = document.getElementById('instruction');
let instructionHidden = false;
let isOpen = true;

function onTap(e) {
  if (!modelReady || !locketGroup) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const cx = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
  const cy = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
  pointer.x =  ((cx - rect.left) / rect.width)  * 2 - 1;
  pointer.y = -((cy - rect.top)  / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  if (raycaster.intersectObjects(locketGroup.children, true).length > 0) {
    isOpen = !isOpen;
    setTargetOpen(isOpen ? 1 : 0);

    if (!instructionHidden) {
      instructionEl.classList.add('hidden');
      instructionHidden = true;
    }
  }
}

// Distinguish taps from OrbitControls drags
let downPos = { x: 0, y: 0 };
renderer.domElement.addEventListener('pointerdown', (e) => {
  downPos.x = e.clientX;
  downPos.y = e.clientY;
});
renderer.domElement.addEventListener('pointerup', (e) => {
  const dx = e.clientX - downPos.x;
  const dy = e.clientY - downPos.y;
  if (Math.sqrt(dx * dx + dy * dy) < TAP_THRESHOLD_PX) onTap(e);
});

// ── "No" button runs away ───────────────────────────────────
const noBtn = document.getElementById('noBtn');

function moveNoButton() {
  const margin = 20;
  const maxX = window.innerWidth  - noBtn.offsetWidth  - margin;
  const maxY = window.innerHeight - noBtn.offsetHeight - margin;
  noBtn.style.left = (margin + Math.random() * (maxX - margin)) + 'px';
  noBtn.style.top  = (margin + Math.random() * (maxY - margin)) + 'px';
}

noBtn.addEventListener('mouseenter', moveNoButton);
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); }, { passive: false });

// ── "Yes" celebration ───────────────────────────────────────
const HEART_EMOJIS = ['❤️', '💕', '💖', '💗', '💘'];

function spawnHeart() {
  const el = document.createElement('div');
  el.className = 'heart-particle';
  el.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
  el.style.left = Math.random() * 100 + 'vw';
  el.style.top  = '-30px';
  el.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
  el.style.animationDuration = (2 + Math.random() * 3) + 's';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

document.getElementById('yesBtn').addEventListener('click', () => {
  document.getElementById('celebration').classList.add('active');
  document.getElementById('buttons').style.display = 'none';
  for (let i = 0; i < 40; i++) setTimeout(spawnHeart, i * 80);
});
