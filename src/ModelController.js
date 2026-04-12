import { VTubeStudioClient } from './VTubeStudioClient.js';

export class ModelController {
  constructor(vtsClient) {
    this.client = vtsClient;
  }

  async getModelList() {
    const result = await this.client.sendRequest('AvailableModelsRequest', {});
    return result.data?.availableModels || [];
  }

  async getCurrentModel() {
    const result = await this.client.sendRequest('CurrentModelRequest', {});
    return result.data;
  }

  async loadModel(modelId, options = {}) {
    const requestData = {
      modelID: modelId,
      ...(options.fadeTime !== undefined && { fadeTime: options.fadeTime }),
      ...(options.position && {
        position: {
          timeInSeconds: options.position.timeInSeconds || 0,
          values: {
            x: options.position.x || 0,
            y: options.position.y || 0,
            rotation: options.position.rotation || 0,
            size: options.position.zoom || 1
          }
        }
      })
    };

    return await this.client.sendRequest('ModelLoadRequest', requestData);
  }

  async unloadModel(fadeTime = 0.5) {
    return await this.client.sendRequest('ModelUnloadRequest', { fadeTime });
  }

  async moveModel(x, y, zoom = 1, timeInSeconds = 0) {
    return await this.client.sendRequest('MoveModelRequest', {
      timeInSeconds,
      valuesAreRelativeToModel: false,
      positionX: x,
      positionY: y,
      size: zoom
    });
  }

  async getAvailableExpressions() {
    const result = await this.client.sendRequest('ExpressionStateRequest', {});
    
    // VTube Studio returns expressions in 'expressions' array
    const expressions = result.data?.expressions || result.data?.availableExpressions || [];
    
    if (expressions.length === 0) {
      console.log('[WARNING] No expressions found. Make sure:');
      console.log('  1. A model is loaded in VTube Studio');
      console.log('  2. The model has expressions configured');
      console.log('  3. VTube Studio API access is enabled');
    }
    
    // Return expression objects with name and file properties
    return expressions.map(exp => ({
      name: exp.name || exp.expressionName || exp.file || exp,
      file: exp.file || exp.expressionFile || exp.name || exp,
      active: exp.active || false
    }));
  }

  async getActiveExpressions() {
    const result = await this.client.sendRequest('ExpressionStateRequest', {});
    return result.data?.activeExpressions || [];
  }

  async triggerExpression(expressionFile, value = 1.0, slot = 0) {
    return await this.client.sendRequest('ExpressionActivationRequest', {
      expressionFile: expressionFile,
      active: true,
      value: value,
      fadeMode: 'linear',
      fadeTime: 0.5,
      ...(slot !== undefined && slot !== null && { autoDeactivateAfterSeconds: false })
    });
  }

  async deactivateExpression(expressionFile, fadeTime = 1) {
    return await this.client.sendRequest('ExpressionActivationRequest', {
      expressionFile: expressionFile,
      active: false,
      fadeTime
    });
  }

  async setParameterValue(id, value, weight = 1) {
    return await this.client.sendRequest('InjectParameterDataRequest', {
      mode: 'add',
      parameterValues: [
        { id, value, weight }
      ]
    });
  }

  async setMultipleParameters(parameters) {
    const paramValues = parameters.map(p => ({
      id: p.id,
      value: p.value,
      weight: p.weight || 1
    }));

    return await this.client.sendRequest('InjectParameterDataRequest', {
      mode: 'add',
      parameterValues: paramValues
    });
  }

  async getModelState() {
    return await this.client.sendRequest('InputParameterListRequest', {});
  }

  async getInputParameters() {
    const result = await this.client.sendRequest('InputParameterListRequest', {});
    // VTS returns defaultParameters and customParameters arrays
    return [
      ...(result.data?.defaultParameters || []),
      ...(result.data?.customParameters || [])
    ];
  }

  async triggerHotkey(hotkeyId) {
    return await this.client.sendRequest('HotkeyTriggerRequest', {
      hotkeyID: hotkeyId
    });
  }

  async getHotkeys() {
    return await this.client.sendRequest('HotkeysInCurrentModelRequest', {});
  }

  async moveModelSmooth(x, y, zoom = 1, duration = 2) {
    return await this.client.sendRequest('MoveModelRequest', {
      timeInSeconds: duration,
      valuesAreRelativeToModel: false,
      positionX: x,
      positionY: y,
      size: zoom
    });
  }

  async resetToNeutral(fadeTime = 0.5) {
    const inputParams = await this.getInputParameters();
    const resetParams = inputParams.map(p => ({
      id: p.name,
      value: p.defaultValue !== undefined ? p.defaultValue : 0,
      weight: 1
    }));

    await this.setMultipleParameters(resetParams);

    const expressions = await this.getActiveExpressions();
    for (const exp of expressions) {
      await this.deactivateExpression(exp.file || exp.name, fadeTime);
    }
  }

  async getCurrentParameterValues() {
    const result = await this.client.sendRequest('ParameterValueRequest', {
      parameterID: '*'
    });

    const params = {};
    if (result.data?.parameterValues) {
      for (const p of result.data.parameterValues) {
        params[p.name || p.id] = p.value;
      }
    }

    return params;
  }

  async getModelStateSnapshot() {
    const [expressions, inputParams] = await Promise.all([
      this.getAvailableExpressions(),
      this.getInputParameters()
    ]);

    return {
      expressions,
      inputParameters: inputParams
    };
  }

  async getAvailableMeshes() {
    const result = await this.client.sendRequest('ArtMeshListRequest', {});
    return result.data?.artMeshNames || result.data?.artMeshes || [];
  }

  async setMeshColor(meshName, color) {
    const tintData = {
      artMeshName: meshName,
      tint: {
        colorR: color.r ?? color.red ?? 0,
        colorG: color.g ?? color.green ?? 0,
        colorB: color.b ?? color.blue ?? 0,
        colorA: color.a ?? color.alpha ?? 1,
        mixWithSceneLightingColor: color.mixWithSceneLightingColor ?? 1
      }
    };

    return await this.client.sendRequest('ColorTintRequest', tintData);
  }

  async setMeshVisibility(meshName, visible) {
    return await this.client.sendRequest('ArtMeshVisibilityRequest', {
      artMeshName: meshName,
      visible
    });
  }

  async smoothParameterTransition(id, targetValue, duration = 500, easing = 'easeInOut') {
    const steps = 20;
    const interval = duration / steps;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const eased = this._applyEasing(t, easing);
      const currentValue = eased * targetValue;

      await this.setParameterValue(id, currentValue, 1);
      await this._sleep(interval);
    }

    await this.setParameterValue(id, targetValue, 1);
  }

  async smoothParameterTransitionBatch(params, duration = 500, easing = 'easeInOut') {
    const steps = 20;
    const interval = duration / steps;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const eased = this._applyEasing(t, easing);

      const batchParams = params.map(p => ({
        id: p.id,
        value: eased * p.value,
        weight: p.weight || 1
      }));

      await this.setMultipleParameters(batchParams);
      await this._sleep(interval);
    }

    // Set final values
    const finalParams = params.map(p => ({
      id: p.id,
      value: p.value,
      weight: p.weight || 1
    }));
    await this.setMultipleParameters(finalParams);
  }

  _applyEasing(t, easing) {
    switch (easing) {
      case 'linear':
        return t;
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return t * (2 - t);
      case 'easeInOut':
      default:
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async playSequence(actions) {
    const sortedActions = [...actions].sort((a, b) => (a.at || 0) - (b.at || 0));
    const startTime = Date.now();

    for (const action of sortedActions) {
      const delay = ((action.at || 0) * 1000) - (Date.now() - startTime);
      if (delay > 0) {
        await this._sleep(delay);
      }

      await this._executeAction(action);
    }
  }

  async _executeAction(action) {
    switch (action.type) {
      case 'expression':
        if (action.active === false) {
          await this.deactivateExpression(action.file, action.fadeTime || 0.5);
        } else {
          await this.triggerExpression(action.file, action.value || 1.0, action.slot || 0);
        }
        break;
      case 'parameter':
        await this.setParameterValue(action.id, action.value, action.weight || 1);
        break;
      case 'parameters':
        await this.setMultipleParameters(action.parameters);
        break;
      case 'move':
        await this.moveModel(action.x, action.y, action.zoom || 1, action.duration || 0);
        break;
      case 'hotkey':
        await this.triggerHotkey(action.hotkeyId);
        break;
      case 'meshColor':
        await this.setMeshColor(action.meshName, action.color);
        break;
      case 'meshVisibility':
        await this.setMeshVisibility(action.meshName, action.visible);
        break;
      case 'reset':
        await this.resetToNeutral(action.fadeTime || 0.5);
        break;
      default:
        console.warn(`[ModelController] Unknown action type: ${action.type}`);
    }
  }

  on(event, callback) {
    if (!this._eventListeners) {
      this._eventListeners = {};
    }
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = [];
    }
    this._eventListeners[event].push(callback);
  }

  off(event, callback) {
    if (!this._eventListeners || !this._eventListeners[event]) return;
    if (callback) {
      this._eventListeners[event] = this._eventListeners[event].filter(cb => cb !== callback);
    } else {
      delete this._eventListeners[event];
    }
  }

  _emit(event, data) {
    if (!this._eventListeners || !this._eventListeners[event]) return;
    for (const callback of this._eventListeners[event]) {
      callback(data);
    }
  }
}
