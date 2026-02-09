/**
 * config.js — All tunable constants in one place.
 * Edit these values to customise the valentine without touching logic.
 */

// ── Personalisation ─────────────────────────────────────────
export const PHOTO_SRC = 'photo.jpg';

export const MESSAGE_LINES = ['Be My', 'Valentine?', '\u2665'];

export const MESSAGE_FONT = 'bold 36px Georgia';
export const MESSAGE_COLOR = '#8b0030';
export const MESSAGE_TOP_OFFSET = 180;   // px from top of 512×512 canvas
export const MESSAGE_LINE_SPACING = 70;  // px between lines

export const CELEBRATION_TEXT = 'You made me the happiest! ❤️';

// ── 3D Model ────────────────────────────────────────────────
export const MODEL_PATH = 'Heart Locket.glb';

// Names of scene-graph nodes that belong to each half
export const LID_PART_NAMES = [
  'Sketchfab_model',
  'Sketchfab_model001',
  'Sketchfab_model004',
  'Sketchfab_model005',
];
export const BASE_PART_NAMES = [
  'Sketchfab_model002',
  'Sketchfab_model003',
  'Sketchfab_model006',
  'Sketchfab_model007',
];

// ── Locket transform ────────────────────────────────────────
export const MODEL_SCALE_TARGET = 0.2;    // normalised size
export const MODEL_ROTATION_X = Math.PI / 2; // stand upright

// ── Lid opening ─────────────────────────────────────────────
export const LID_OPEN_ANGLE = Math.PI * 0.783; // ~117 °
export const LID_OPEN_SPEED = 0.07;           // lerp factor per frame

// ── Placeholder planes ──────────────────────────────────────
// Multipliers applied to the bounding-box dimensions
export const PLANE_W_MULT = 2.2;   // width  = baseSize.z × this
export const PLANE_H_MULT = 1.1;   // height = baseSize.y × this

// Position offsets  (world-space, applied to bbox center)
export const PHOTO_POS_X_MULT  = 0.978;  // depth into base half
export const PHOTO_POS_Y_OFFSET = 0.01;
export const PHOTO_POS_Z_OFFSET = 0.004;
export const PHOTO_ROTATION_DEG = 21;     // degrees

export const MSG_POS_X_MULT  = 0.958;
export const MSG_POS_Y_OFFSET = 0.01;
export const MSG_POS_Z_OFFSET = 0.0045;
export const MSG_ROTATION_DEG = -18.6;

// ── Heart alpha mask ────────────────────────────────────────
export const HEART_MASK_SCALE = 0.45; // radius relative to canvas size
export const CANVAS_SIZE = 512;

// ── Camera ──────────────────────────────────────────────────
export const CAMERA_FOV = 45;
export const CAMERA_NEAR = 0.01;
export const CAMERA_FAR = 100;
export const CAMERA_POS = { x: -0.05, y: 0, z: 0.25 }; // offset toward base half

// ── OrbitControls ───────────────────────────────────────────
export const ORBIT_TARGET = { x: -0.05, y: 0, z: 0 };  // focus on the base (non-opening) half
export const ORBIT_DAMPING = 0.08;
export const ORBIT_MIN_DIST = 0.15;
export const ORBIT_MAX_DIST = 1.0;

// ── Background particles ────────────────────────────────────
export const PARTICLE_COUNT = 80;
export const PARTICLE_SIZE = 0.005;
export const PARTICLE_COLOR = 0xff69b4;
export const PARTICLE_OPACITY = 0.4;

// ── Tap detection ───────────────────────────────────────────
export const TAP_THRESHOLD_PX = 10; // max pointer travel to count as a tap
