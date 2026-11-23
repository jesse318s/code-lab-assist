// Offline BrainScan runner used by the forensic analyzer.
// It reuses the scanner's own feature extractor and trained snapshot without
// injecting into a live page or starting the BrainScan HTTP server.
const fs = require('fs');
const path = require('path');

const NeuralNetwork = require('../brainscan/vendor/brain.js/dist/neural-network').default;
const { extractFeatures } = require('../brainscan/src/utils/utils');
const { scanNeuralNetworkConfig, riskThresholds } = require('../brainscan/src/constants/settings');

const DEFAULT_SNAPSHOT_PATH = path.resolve(__dirname, '..', 'brainscan', 'data', 'trained-network.json');

const classifyRisk = (risk) => {
  if (risk < riskThresholds.low) return 'Low Risk';
  if (risk < riskThresholds.medium) return 'Medium Risk';
  if (risk < riskThresholds.high) return 'High Risk';
  return 'Critical Risk';
};

const scanCode = (code, snapshotPath = DEFAULT_SNAPSHOT_PATH) => {
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const net = new NeuralNetwork(scanNeuralNetworkConfig);

  net.fromJSON(snapshot);

  const features = extractFeatures(code);
  const output = net.run(features);
  const risk = output.risk;

  return {
    risk,
    riskPercent: Math.round(risk * 100),
    label: classifyRisk(risk),
    features,
  };
};

module.exports = { scanCode, DEFAULT_SNAPSHOT_PATH };

// CLI mode: Python sends {"code": "...", "snapshotPath": "..."} on stdin.
if (require.main === module) {
  let input = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const payload = JSON.parse(input);
      const result = scanCode(payload.code, payload.snapshotPath);

      process.stdout.write(JSON.stringify(result));
    } catch (err) {
      process.stderr.write(String(err && err.stack ? err.stack : err));
      process.exitCode = 1;
    }
  });
}
