import { VTubeStudioClient } from './VTubeStudioClient.js';
import { ModelController } from './ModelController.js';

export { VTubeStudioClient, ModelController };

export async function createVTSController(options = {}) {
  const client = new VTubeStudioClient(options);
  await client.connect();
  
  await client.authenticate(
    options.pluginName || 'VTS Controller',
    options.pluginDeveloper || 'Custom',
    options.pluginIcon
  );

  return new ModelController(client);
}
