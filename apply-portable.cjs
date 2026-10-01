const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || '.');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n');
}
function write(rel, value) {
  fs.writeFileSync(path.join(root, rel), value.replace(/\r\n/g, '\n'));
}
function replaceExact(rel, before, after) {
  const value = read(rel);
  if (!value.includes(before)) throw new Error('Missing build patch anchor in ' + rel);
  write(rel, value.replace(before, after));
}

const pkg = JSON.parse(read('package.json'));
pkg.name = 'ailis-personal';
pkg.version = '1.4.8-local.1';
pkg.productName = 'AILIS Personal';
pkg.description = 'AILIS Personal - local-first anime desktop AI companion with optional cloud providers.';
write('package.json', JSON.stringify(pkg, null, 2) + '\n');

replaceExact('electron-builder.yml', 'appId: com.ailis.desktop', 'appId: com.ailis.personal');
replaceExact('electron-builder.yml', 'productName: AILIS', 'productName: AILIS Personal');
replaceExact('electron-builder.yml', '  ailisBundledAsr: true', '  ailisBundledAsr: false');
replaceExact('electron-builder.yml',
  'extraResources:\n  - from: build-cache/ailis-wake-model\n    to: ailis-wake-model\n  - from: build-cache/ailis-asr-runtime\n    to: ailis-asr-runtime\n    filter:\n      - "**/*"\n      - "!**/__pycache__/**"\n      - "!**/*.pyc"\n      - "!**/*.incomplete"\n',
  '');
replaceExact('electron-builder.yml', '  executableName: AILIS', '  executableName: AILIS-Personal');

replaceExact('electron/desktop-llm-provider.cjs', 'const DEFAULT_PROVIDER = OPENAI_COMPATIBLE_PROVIDER;', "const DEFAULT_PROVIDER = 'ollama';");
replaceExact('electron/store.cjs',
  "const DEFAULT_LLM_PROVIDER = AILIS_CLOUD_PROVIDER;\nconst DEFAULT_LLM_BASE_URL = 'https://150.109.13.189/api/llm/v1';\nconst DEFAULT_LLM_MODEL = 'ailis-cloud';",
  "const DEFAULT_LLM_PROVIDER = 'ollama';\nconst DEFAULT_LLM_BASE_URL = 'http://127.0.0.1:11434';\nconst DEFAULT_LLM_MODEL = 'qwen2.5:1.5b';");
replaceExact('electron/store.cjs', "return provider === 'ailis-cloud' ? 'server' : provider === 'ollama' ? 'local' : 'direct';", "return provider === 'ailis-cloud' ? 'server' : ['ollama', 'vllm'].includes(provider) ? 'local' : 'direct';");

console.log('AILIS Personal portable patch applied successfully.');
