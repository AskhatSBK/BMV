/**
 * locket.js — Loads the GLB model, splits it into base + lid,
 * creates the hinge pivot, and exposes state for animation.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './scene.js';
import { addInnerContent } from './content.js';
import {
  MODEL_PATH, MODEL_SCALE_TARGET, MODEL_ROTATION_X,
  LID_PART_NAMES, BASE_PART_NAMES,
  LID_OPEN_ANGLE, LID_OPEN_SPEED,
} from './config.js';

// ── Public state ────────────────────────────────────────────
export let locketGroup = null;
export let lidPivot    = null;
export let modelReady  = false;

let openAmount = 1;
let targetOpen = 1;

export function setTargetOpen(v) { targetOpen = v; }
export function getTargetOpen()  { return targetOpen; }

// ── Animate lid each frame ──────────────────────────────────
export function animateLid() {
  openAmount += (targetOpen - openAmount) * LID_OPEN_SPEED;
  if (lidPivot) {
    lidPivot.rotation.z = openAmount * LID_OPEN_ANGLE;
  }
}

// ── Load model ──────────────────────────────────────────────
export function loadLocket() {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(MODEL_PATH, (gltf) => {
      const model = gltf.scene;

      // Stand the model upright
      model.rotation.x = MODEL_ROTATION_X;

      // Scale to a normalised size
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const scale = MODEL_SCALE_TARGET / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(scale);

      // Centre at origin
      model.updateMatrixWorld(true);
      const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      model.position.sub(center);

      // Wrap in a group (useful for OrbitControls target)
      locketGroup = new THREE.Group();
      locketGroup.add(model);
      scene.add(locketGroup);

      // ── Split into lid / base ──
      const lidParts  = [];
      const baseParts = [];

      for (const child of [...model.children]) {
        if (LID_PART_NAMES.includes(child.name))  lidParts.push(child);
        if (BASE_PART_NAMES.includes(child.name)) baseParts.push(child);
      }

      // ── Bounding boxes (world-space, before pivot reparenting) ──
      model.updateMatrixWorld(true);

      const baseBBox = new THREE.Box3();
      for (const p of baseParts) baseBBox.expandByObject(p);

      const lidBBox = new THREE.Box3();
      for (const p of lidParts) lidBBox.expandByObject(p);

      // ── Create hinge pivot for the lid ──
      const cylinder = model.getObjectByName('Cylinder');
      const hingePos = cylinder ? cylinder.position.clone() : new THREE.Vector3();

      if (lidParts.length > 0) {
        lidPivot = new THREE.Group();
        lidPivot.name = 'lidPivot';
        lidPivot.position.copy(hingePos);
        model.add(lidPivot);

        for (const part of lidParts) lidPivot.attach(part);
      }

      // ── Add photo & message planes inside the halves ──
      const baseCenterWorld = baseBBox.getCenter(new THREE.Vector3());
      const lidCenterWorld  = lidBBox.getCenter(new THREE.Vector3());
      const baseSize = baseBBox.getSize(new THREE.Vector3());
      const lidSize  = lidBBox.getSize(new THREE.Vector3());

      addInnerContent(locketGroup, lidPivot, baseCenterWorld, lidCenterWorld, baseSize, lidSize);

      modelReady = true;
      resolve();
    }, undefined, reject);
  });
}
