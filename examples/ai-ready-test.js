import { createVTSController } from '../src/index.js';

async function main() {
  console.log('=== AI-Ready Controller Test ===\n');

  const controller = await createVTSController({
    pluginName: 'AI-Ready Test',
    pluginDeveloper: 'VTS Controller Demo'
  });

  try {
    // 1. Test state snapshot
    console.log('1. Getting model state snapshot...');
    const snapshot = await controller.getModelStateSnapshot();
    console.log(`   Expressions: ${snapshot.expressions.length}`);
    console.log(`   Input parameters: ${snapshot.inputParameters.length}`);

    // 2. Test available meshes
    console.log('\n2. Getting available meshes...');
    const meshes = await controller.getAvailableMeshes();
    console.log(`   Found ${meshes.length} meshes`);

    // 3. Test smooth transition
    console.log('\n3. Testing smooth parameter transition (EyeOpenLeft → 0.3)...');
    await controller.smoothParameterTransition('EyeOpenLeft', 0.3, 1000);
    console.log('   Done! Waiting 1s...');
    await new Promise(r => setTimeout(r, 1000));

    // 4. Test batch transition
    console.log('\n4. Testing batch transition (both eyes open)...');
    await controller.smoothParameterTransitionBatch([
      { id: 'EyeOpenLeft', value: 1.0 },
      { id: 'EyeOpenRight', value: 1.0 }
    ], 800);
    console.log('   Done!');

    // 5. Test reset to neutral
    console.log('\n5. Testing reset to neutral...');
    await controller.resetToNeutral();
    console.log('   Model reset!');

    // 6. Test sequence playback
    console.log('\n6. Testing animation sequence...');
    await controller.playSequence([
      { type: 'expression', file: 'Shying.exp3.json', value: 1.0, at: 0 },
      { type: 'parameter', id: 'MouthSmile', value: 0.5, at: 1 },
      { type: 'reset', at: 2.5 }
    ]);
    console.log('   Sequence completed!');

    // 7. Test event system
    console.log('\n7. Testing event system...');
    controller.on('testEvent', (data) => {
      console.log(`   Event received: ${JSON.stringify(data)}`);
    });
    controller._emit('testEvent', { message: 'Hello from events!' });

    console.log('\n=== All tests passed! ===');
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    controller.client.disconnect();
  }
}

main();
