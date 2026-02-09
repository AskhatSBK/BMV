/**
 * scene.js — Three.js scene, camera, renderer, lighting & background particles.
 * Exports ready-to-use singletons so other modules can add objects to the scene.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  CAMERA_FOV, CAMERA_NEAR, CAMERA_FAR, CAMERA_POS,
  ORBIT_TARGET, ORBIT_DAMPING, ORBIT_MIN_DIST, ORBIT_MAX_DIST,
  PARTICLE_COUNT, PARTICLE_SIZE, PARTICLE_COLOR, PARTICLE_OPACITY,
} from './config.js';

// ── Scene & camera ──────────────────────────────────────────
export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera(
  CAMERA_FOV,
  window.innerWidth / window.innerHeight,
  CAMERA_NEAR,
  CAMERA_FAR,
);
camera.position.set(CAMERA_POS.x, CAMERA_POS.y, CAMERA_POS.z);

// ── Renderer ────────────────────────────────────────────────
export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// ── OrbitControls ───────────────────────────────────────────
export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = ORBIT_DAMPING;
controls.enablePan = false;
controls.minDistance = ORBIT_MIN_DIST;
controls.maxDistance = ORBIT_MAX_DIST;
controls.target.set(ORBIT_TARGET.x, ORBIT_TARGET.y, ORBIT_TARGET.z);

// ── Lighting ────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffc0cb, 0.6));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(2, 3, 4);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffb6c1, 0.8);
fillLight.position.set(-2, 1, 2);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xff69b4, 0.6);
rimLight.position.set(0, -1, -3);
scene.add(rimLight);

// ── Background particles ────────────────────────────────────
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  positions[i * 3]     = (Math.random() - 0.5) * 2;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 2 - 1;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
  color: PARTICLE_COLOR,
  size: PARTICLE_SIZE,
  transparent: true,
  opacity: PARTICLE_OPACITY,
});
scene.add(new THREE.Points(particleGeometry, particleMaterial));

/** Called every frame to gently bob the particles. */
export function animateParticles() {
  const arr = particleGeometry.attributes.position.array;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    arr[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.0002;
  }
  particleGeometry.attributes.position.needsUpdate = true;
}

// ── Resize handling ─────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
