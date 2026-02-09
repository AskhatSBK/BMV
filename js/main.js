/**
 * main.js — Entry point. Boots the scene, loads the model,
 * sets up interaction, and starts the render loop.
 */
import { scene, camera, renderer, controls, animateParticles } from './scene.js';
import { loadLocket, animateLid } from './locket.js';
import './interaction.js'; // self-initialising (attaches event listeners)

// ── Load model then start ───────────────────────────────────
loadLocket()
  .then(() => {
    document.getElementById('loading').style.display = 'none';
  })
  .catch((err) => {
    console.error('Failed to load model:', err);
    document.getElementById('loading').textContent = 'Failed to load model';
  });

// ── Render loop ─────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  animateLid();
  controls.update();
  animateParticles();
  renderer.render(scene, camera);
}
animate();
