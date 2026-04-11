# VTube Studio Controller

Control VTube Studio models programmatically using the official VTS WebSocket API.

## Features

- 🔌 WebSocket connection to VTube Studio
- 🔐 Automatic authentication flow
- 🎭 Trigger / deactivate expressions
- 🎯 Move, position, zoom models
- 📊 Set custom parameter values
- 🔑 Activate hotkeys programmatically

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
// → [{ name: 'Smile', file: 'smile.vexp3.json', ... }]

// Trigger an expression
await ctrl.triggerExpression('smile.vexp3.json', 1);

// Deactivate an expression
await ctrl.deactivateExpression('smile.vexp3.json', 1);
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

// List all parameters the model has
const state = await ctrl.getModelState();
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
