const results = require('../results.json');

console.log(`::set-output name=results,::${results.testResults[0].message}`);
