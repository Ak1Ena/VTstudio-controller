# VTube Studio Controller

Control VTube Studio models programmatically using the official VTS WebSocket API.

## Features

- 🔌 WebSocket connection to VTube Studio
- 🔐 Automatic authentication flow
- 🎭 Trigger / deactivate expressions
- 🎯 Move, position, zoom models
- 📊 Set custom parameter values
- 🔑 Activate hotkeys programmatically
- 🌈 Control art mesh colors and visibility
- 🎬 Timed animation sequences
- 🤖 AI-ready: smooth transitions, state tracking, event system

## Setup

### 1. Enable the VTS API

1. Open **VTube Studio**
2. Go to ⚙️ **Settings** → **App Settings**
3. Turn on **"Activate websocket API"**
4. Leave the port at **8001** (default)

### 2. Install dependencies

```bash
npm install
```

## Quick Start — Close Left Eye

```bash
node examples/test-close-left-eye.js
```

On the **first run** a popup will appear in VTube Studio — click **Allow**.
The script will close the left eye for 3 seconds then open it back.

## Your Own Script

Create a file, e.g. `my-script.js`:

```javascript
import { createVTSController } from './src/index.js';

async function main() {
  // Connect & authenticate
  const ctrl = await createVTSController({
    pluginName: 'My Script',
    pluginDeveloper: 'Me'
  });

  // List all models
  const models = await ctrl.getModelList();
  console.log(models);

  // Close left eye for 2 seconds
  await ctrl.setParameterValue('EyeOpenLeft', 0, 1);
  await new Promise(r => setTimeout(r, 2000));
  await ctrl.setParameterValue('EyeOpenLeft', 1, 1);

  // Disconnect
  ctrl.client.disconnect();
}

main();
```

```bash
node my-script.js
```

## All Examples

| Command | What it does |
|---|---|
| `node examples/test-close-left-eye.js` | Closes left eye for 3 s |
| `node examples/basic-control.js` | Lists models, loads one, moves it |
| `node examples/expression-control.js` | Lists & triggers expressions |
| `node examples/model-movement.js` | Smooth movement demo |
| `node examples/ai-ready-test.js` | Tests all AI-ready methods |

## API Reference

### Connect & Authenticate

```javascript
import { createVTSController } from './src/index.js';

const ctrl = await createVTSController({
  pluginName: 'My App',      // required
  pluginDeveloper: 'Me',     // required
  host: '127.0.0.1',         // optional, default
  port: 8001                 // optional, default
});
```

### Model Management

```javascript
// List all available models
const models = await ctrl.getModelList();
// → [{ modelID: '...', modelName: '...', ... }]

// Get current model info
const current = await ctrl.getCurrentModel();

// Load a specific model
await ctrl.loadModel('modelID', {
  fadeTime: 0.5,
  position: { x: 0, y: 0, zoom: 1, timeInSeconds: 0.5 }
});

// Unload current model
await ctrl.unloadModel(0.5);
```

### Expressions

```javascript
// List all expressions on the current model
const expressions = await ctrl.getAvailableExpressions();
// → [{ name: 'Smile', file: 'smile.exp3.json', active: false }]

// Trigger an expression (expressionFile, value, slot)
await ctrl.triggerExpression('smile.exp3.json', 1.0, 0);

// Deactivate an expression
await ctrl.deactivateExpression('smile.exp3.json', 1);

// Get currently active expressions
const active = await ctrl.getActiveExpressions();
```

### Movement

```javascript
// Move model to position (x, y) with zoom, over N seconds
await ctrl.moveModel(2, 3, 1.2, 0.5);

// Smooth animated move
await ctrl.moveModelSmooth(0, 0, 1, 2);
```

### Parameters

```javascript
// Set one parameter
await ctrl.setParameterValue('EyeOpenLeft', 0, 1);

// Set multiple at once
await ctrl.setMultipleParameters([
  { id: 'EyeOpenLeft',  value: 0, weight: 1 },
  { id: 'EyeOpenRight', value: 0, weight: 1 },
  { id: 'MouthSmile',   value: 1, weight: 1 }
]);

// Smooth transition with easing (duration in ms)
await ctrl.smoothParameterTransition('EyeOpenLeft', 0.3, 500, 'easeInOut');
// Easing options: 'easeInOut', 'easeIn', 'easeOut', 'linear'

// Smooth batch transition for multiple parameters
await ctrl.smoothParameterTransitionBatch([
  { id: 'EyeOpenLeft',  value: 0.3 },
  { id: 'EyeOpenRight', value: 0.3 }
], 800);

// Get current live parameter values
const values = await ctrl.getCurrentParameterValues();
// → { EyeOpenLeft: 1.0, MouthSmile: 0.0, FaceAngleZ: 5 }

// List all parameters the model has
const state = await ctrl.getModelState();
```

### State Tracking

```javascript
// Get full model state snapshot
const snapshot = await ctrl.getModelStateSnapshot();
// → { expressions: [...], inputParameters: [...] }

// Reset all parameters to neutral + deactivate expressions
await ctrl.resetToNeutral();

// Reset with custom fade time
await ctrl.resetToNeutral(1.0);
```

### Art Mesh Control

```javascript
// List all art meshes on current model
const meshes = await ctrl.getAvailableMeshes();

// Tint a mesh with color
await ctrl.setMeshColor('Blush', {
  r: 255, g: 100, b: 100, a: 0.4  // pink blush
});

// Show/hide a mesh
await ctrl.setMeshVisibility('Tear', true);
await ctrl.setMeshVisibility('Tear', false);
```

### Animation Sequences

```javascript
// Play a timed sequence of actions
await ctrl.playSequence([
  { type: 'expression', file: 'smile.exp3.json', value: 1.0, at: 0 },
  { type: 'parameter', id: 'MouthSmile', value: 0.5, at: 1 },
  { type: 'move', x: 2, y: 0, zoom: 1.2, at: 2, duration: 1 },
  { type: 'meshColor', meshName: 'Blush', color: { r: 255, g: 100, b: 100, a: 0.3 }, at: 3 },
  { type: 'reset', at: 5 }  // reset everything at 5s
]);

// Action types:
// 'expression'     - trigger/deactivate expression
// 'parameter'      - set single parameter
// 'parameters'     - set multiple parameters
// 'move'           - move model position
// 'hotkey'         - trigger hotkey
// 'meshColor'      - tint mesh
// 'meshVisibility' - show/hide mesh
// 'reset'          - reset to neutral state
```

### Event System

```javascript
// Listen for custom events
controller.on('customEvent', (data) => {
  console.log('Event:', data);
});

// Remove specific listener
controller.off('customEvent', callback);

// Remove all listeners for an event
controller.off('customEvent');
```

### Hotkeys

```javascript
// List hotkeys on the current model
const hotkeys = await ctrl.getHotkeys();

// Trigger one by ID
await ctrl.triggerHotkey('hotkeyID');
```

### Low-Level Client

```javascript
import { VTubeStudioClient, ModelController } from './src/index.js';

const client = new VTubeStudioClient({ host: '127.0.0.1', port: 8001 });
await client.connect();
await client.authenticate('My App', 'Me');

// Any VTS endpoint is available:
const result = await client.sendRequest('APIStateRequest', {});

const ctrl = new ModelController(client);
// ... use ctrl methods

client.disconnect();
```

## Common Parameter Names

| Parameter | Description | Range |
|---|---|---|
| `EyeOpenLeft` | Left eye open/close | 0 – 1 |
| `EyeOpenRight` | Right eye open/close | 0 – 1 |
| `MouthSmile` | Smile intensity | 0 – 1 |
| `MouthOpen` | Mouth open amount | 0 – 1 |
| `FaceAngleX` | Head tilt left/right | -30 – 30 |
| `FaceAngleY` | Head nod up/down | -30 – 30 |
| `FaceAngleZ` | Head rotation | -30 – 30 |
| `PosX` / `PosY` | Model position | varies |
| `Zoom` | Model scale | 0 – 2+ |

Use `getModelState()` to see every parameter your specific model supports.

## Troubleshooting

| Problem | Fix |
|---|---|
| **Connection refused** | Make sure VTube Studio is running and the WebSocket API is enabled |
| **Auth popup doesn't appear** | Close VTS, reopen it, make sure API is enabled, run the script again |
| **"not authenticated" error** | The first run requires you to click **Allow** on the VTS popup |
| **Parameter does nothing** | Not all models have every parameter — check `getModelState()` |

## Official VTS API Docs

<https://denchisoft.notion.site/VTube-Studio-Public-API-Documentation-2eb58a0319e4428fa775be8c8d3b4073>

## License

MIT
