import { createVTSController } from '../src/index.js';

async function main() {
  console.log('=== VTube Studio Model Movement Example ===\n');

  const controller = await createVTSController({
    pluginName: 'Model Movement Example',
    pluginDeveloper: 'VTS Controller Demo'
  });

  try {
    // Get current model
    console.log('Getting current model info...');
    const currentModel = await controller.getCurrentModel();
    console.log(`Current model: ${currentModel.modelName}`);

    // Movement sequence
    const positions = [
      { x: 3, y: 0, zoom: 1.2, label: 'Right' },
      { x: -3, y: 0, zoom: 1.2, label: 'Left' },
      { x: 0, y: 3, zoom: 0.8, label: 'Up (zoomed out)' },
      { x: 0, y: -3, zoom: 1.5, label: 'Down (zoomed in)' },
      { x: 0, y: 0, zoom: 1, label: 'Center' }
    ];

    for (const pos of positions) {
      console.log(`\nMoving ${pos.label}...`);
      await controller.moveModel(pos.x, pos.y, pos.zoom, 1);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Smooth parameter control example
    console.log('\nDemo: Setting custom parameters...');
    
    // Try setting face angle parameters (common in most models)
    try {
      await controller.setMultipleParameters([
        { id: 'FaceAngleX', value: 15, weight: 1 },
        { id: 'FaceAngleY', value: 10, weight: 1 },
        { id: 'FaceAngleZ', value: 5, weight: 1 }
      ]);
      console.log('Set face angles');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reset
      await controller.setMultipleParameters([
        { id: 'FaceAngleX', value: 0, weight: 1 },
        { id: 'FaceAngleY', value: 0, weight: 1 },
        { id: 'FaceAngleZ', value: 0, weight: 1 }
      ]);
      console.log('Reset face angles');
    } catch (error) {
      console.log('Note: Some parameters may not be available in your model');
    }

    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    controller.client.disconnect();
  }
}

main();
