import { createVTSController } from '../src/index.js';

async function main() {
  console.log('=== VTube Studio Expression Control Example ===\n');

  const controller = await createVTSController({
    pluginName: 'Expression Control Example',
    pluginDeveloper: 'VTS Controller Demo'
  });

  try {
    // Get available expressions
    console.log('Fetching available expressions...');
    const expressions = await controller.getAvailableExpressions();
    console.log(`Found ${expressions.length} expressions:`);
    expressions.forEach((exp, i) => {
      console.log(`  ${i + 1}. ${exp.name} (${exp.file})`);
    });

    if (expressions.length > 0) {
      // Trigger first expression
      const firstExpression = expressions[0];
      console.log(`\nTriggering expression: ${firstExpression.name}`);
      await controller.triggerExpression(firstExpression.file, 1.0, 1);

      // Wait and deactivate
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Deactivating expression...');
      await controller.deactivateExpression(firstExpression.file, 1);

      // Demo with multiple expressions if available
      if (expressions.length > 1) {
        console.log('\nQuick expression sequence...');
        for (let i = 0; i < Math.min(3, expressions.length); i++) {
          const exp = expressions[i];
          console.log(`  Triggering: ${exp.name}`);
          await controller.triggerExpression(exp.file, 1.0, 0.5);
          await new Promise(resolve => setTimeout(resolve, 1500));
          await controller.deactivateExpression(exp.file, 0.5);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    controller.client.disconnect();
  }
}

main();
