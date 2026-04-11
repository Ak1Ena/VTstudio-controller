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
    const result = await this.client.sendRequest('ExpressionStateRequest', { details: true });
    return result.data?.availableExpressions || [];
  }

  async getActiveExpressions() {
    const result = await this.client.sendRequest('ExpressionStateRequest', { details: false });
    return result.data?.activeExpressions || [];
  }

  async triggerExpression(expressionName, fadeTime = 1) {
    return await this.client.sendRequest('ExpressionActivationRequest', {
      expressionFile: expressionName,
      active: true,
      fadeTime
    });
  }

  async deactivateExpression(expressionName, fadeTime = 1) {
    return await this.client.sendRequest('ExpressionActivationRequest', {
      expressionFile: expressionName,
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
