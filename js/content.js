/**
 * content.js — Heart-shaped alpha mask, photo plane & message plane.
 * Creates the two inner-locket planes and parents them correctly.
 */
import * as THREE from 'three';
import {
  PHOTO_SRC,
  MESSAGE_LINES, MESSAGE_FONT, MESSAGE_COLOR,
  MESSAGE_TOP_OFFSET, MESSAGE_LINE_SPACING,
  CANVAS_SIZE, HEART_MASK_SCALE,
  PLANE_W_MULT, PLANE_H_MULT,
  PHOTO_POS_X_MULT, PHOTO_POS_Y_OFFSET, PHOTO_POS_Z_OFFSET, PHOTO_ROTATION_DEG,
  MSG_POS_X_MULT, MSG_POS_Y_OFFSET, MSG_POS_Z_OFFSET, MSG_ROTATION_DEG,
} from './config.js';

// ── Heart-shaped alpha mask (computed once, reused) ─────────
function createHeartAlpha(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

// Draw a heart shape matching the locket lid silhouette
  const cx = size / 2;
  const cy = size / 2;
  const s  = size * HEART_MASK_SCALE;

  // The 3D locket has smooth, round lobes with a gentle dip.
  // We trace: top-center dip → left lobe top → left widest → bottom tip
  //           → right widest → right lobe top → back to dip

  const dip  = 0.45;  // how deep the center valley is
  const top  = 0.90;  // how high the lobe peaks reach
  const wide = 1.05;  // how wide the lobes bulge
  const bot  = 1.10;  // how far down the bottom tip extends

  ctx.beginPath();
  ctx.moveTo(cx, cy - s * dip);

  // ── Left lobe (top arch → widest point) ──
  ctx.bezierCurveTo(
    cx - s * 0.45, cy - s * top,   // CP1: pull up-left into the arch
    cx - s * wide, cy - s * 0.70,  // CP2: round the outer bulge
    cx - s * wide, cy - s * 0.05,  // end at widest point (equator)
  );
  // ── Left lower cheek → bottom tip ──
  ctx.bezierCurveTo(
    cx - s * wide, cy + s * 0.50,  // CP3: keep the cheek full and round
    cx - s * 0.40, cy + s * 0.90,  // CP4: smooth approach to tip
    cx,            cy + s * bot,   // bottom tip
  );

  // ── Right lower cheek (mirror) ──
  ctx.bezierCurveTo(
    cx + s * 0.40, cy + s * 0.90,
    cx + s * wide, cy + s * 0.50,
    cx + s * wide, cy - s * 0.05,
  );
  // ── Right lobe top arch → back to dip ──
  ctx.bezierCurveTo(
    cx + s * wide, cy - s * 0.70,
    cx + s * 0.45, cy - s * top,
    cx,            cy - s * dip,
  );

  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();
  return c;
}

const heartAlphaCanvas = createHeartAlpha(CANVAS_SIZE);

/** Draw arbitrary content, then clip it with the heart mask. */
function drawHeartMasked(ctx, size, drawFn) {
  drawFn(ctx, size);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(heartAlphaCanvas, 0, 0, size, size);
  ctx.globalCompositeOperation = 'source-over';
}

// ── Shared material settings ────────────────────────────────
function createPlaneMaterial(texture) {
  return new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
}

// ── Photo texture ───────────────────────────────────────────
function createPhotoTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);

  const img = new Image();
  img.onload = () => {
    drawHeartMasked(ctx, CANVAS_SIZE, (c, sz) => {
      const a = img.width / img.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (a > 1) { sx = (img.width - img.height) / 2; sw = img.height; }
      else       { sy = (img.height - img.width) / 2; sh = img.width; }
      c.drawImage(img, sx, sy, sw, sh, 0, 0, sz, sz);
    });
    texture.needsUpdate = true;
  };
  img.onerror = () => {
    drawHeartMasked(ctx, CANVAS_SIZE, (c, sz) => {
      const grad = c.createRadialGradient(256, 256, 50, 256, 256, 250);
      grad.addColorStop(0, '#ff69b4');
      grad.addColorStop(1, '#8b0030');
      c.fillStyle = grad;
      c.fillRect(0, 0, sz, sz);
      c.fillStyle = 'white';
      c.font = 'bold 40px Georgia';
      c.textAlign = 'center';
      c.fillText('Your Photo', 256, 240);
      c.fillText('Here', 256, 290);
      c.font = '80px serif';
      c.fillText('\u{1F495}', 256, 400);
    });
    texture.needsUpdate = true;
  };
  img.src = PHOTO_SRC;

  return texture;
}

// ── Message texture ─────────────────────────────────────────
function createMessageTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');

  drawHeartMasked(ctx, CANVAS_SIZE, (c, sz) => {
    const grad = c.createRadialGradient(256, 256, 50, 256, 256, 300);
    grad.addColorStop(0, '#fff0f5');
    grad.addColorStop(1, '#ffe4e9');
    c.fillStyle = grad;
    c.fillRect(0, 0, sz, sz);
    c.fillStyle = MESSAGE_COLOR;
    c.font = MESSAGE_FONT;
    c.textAlign = 'center';
    MESSAGE_LINES.forEach((line, i) => {
      c.fillText(line, 256, MESSAGE_TOP_OFFSET + i * MESSAGE_LINE_SPACING);
    });
  });

  return new THREE.CanvasTexture(canvas);
}

// ── Public: build and attach both planes ────────────────────
export function addInnerContent(worldParent, lidPivotRef, baseCW, lidCW, baseSize, lidSize) {
  const planeW = baseSize.z * PLANE_W_MULT;
  const planeH = baseSize.y * PLANE_H_MULT;
  const deg    = Math.PI / 180;

  // Photo plane → base half (stays with worldParent)
  const photoPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(planeW, planeH),
    createPlaneMaterial(createPhotoTexture()),
  );
  photoPlane.position.set(
    baseCW.x * PHOTO_POS_X_MULT,
    baseCW.y + PHOTO_POS_Y_OFFSET,
    baseCW.z + PHOTO_POS_Z_OFFSET,
  );
  photoPlane.rotation.y = deg * PHOTO_ROTATION_DEG;
  worldParent.add(photoPlane);

  // Message plane → lid half (will be reparented to lidPivot)
  const msgPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(planeW, planeH),
    createPlaneMaterial(createMessageTexture()),
  );
  msgPlane.position.set(
    lidCW.x * MSG_POS_X_MULT,
    lidCW.y + MSG_POS_Y_OFFSET,
    lidCW.z + MSG_POS_Z_OFFSET,
  );
  msgPlane.rotation.y = deg * MSG_ROTATION_DEG;
  worldParent.add(msgPlane);

  // Reparent to lid so it swings open with the lid
  if (lidPivotRef) {
    lidPivotRef.attach(msgPlane);
  }
}
