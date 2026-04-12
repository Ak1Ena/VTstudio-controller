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

  async getOutputParameters() {
    const result = await this.client.sendRequest('OutputParameterListRequest', {});
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
}
