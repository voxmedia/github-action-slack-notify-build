const results = require('../results.json');
const text = `::set-output name=results,::${results.numFailedTestSuites} test failure(s):\n\n\`\`\`${results.testResults[0].message}\`\`\``;

process.stdout.write(text.replace(/\r/g, '%0D').replace(/\n/g, '%0A'));
