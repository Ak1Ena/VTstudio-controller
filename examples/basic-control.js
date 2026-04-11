import { createVTSController } from '../src/index.js';

async function main() {
  console.log('=== VTube Studio Basic Control Example ===\n');

  const controller = await createVTSController({
    pluginName: 'Basic Control Example',
    pluginDeveloper: 'VTS Controller Demo'
  });

  try {
    // List available models
    console.log('Fetching available models...');
    const models = await controller.getModelList();
    console.log(`Found ${models.length} models:`);
    models.forEach((model, i) => {
      console.log(`  ${i + 1}. ${model.modelName} (${model.modelID})`);
    });

    if (models.length > 0) {
      // Load the first model
      const firstModel = models[0];
      console.log(`\nLoading model: ${firstModel.modelName}`);
      await controller.loadModel(firstModel.modelID, {
        position: { x: 0, y: 0, zoom: 1, timeInSeconds: 0.5 }
      });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Move the model
      console.log('\nMoving model to position (2, 3)');
      await controller.moveModel(2, 3, 1, 0.5);

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Move back to center
      console.log('Moving model back to center');
      await controller.moveModel(0, 0, 1, 0.5);
    }

    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    controller.client.disconnect();
  }
}

main();
