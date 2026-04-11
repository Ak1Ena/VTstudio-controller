import { createVTSController } from '../src/index.js';

async function main() {
  console.log('=== Close Left Eye Test ===\n');

  const controller = await createVTSController({
    pluginName: 'Close Left Eye Test',
    pluginDeveloper: 'VTS Controller Demo'
  });

  try {
    console.log('Closing left eye...');
    await controller.setParameterValue('EyeOpenLeft', 0.0, 1);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Opening left eye...');
    await controller.setParameterValue('EyeOpenLeft', 1.0, 1);
    
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    controller.client.disconnect();
  }
}

main();
