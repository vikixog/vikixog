const fs=require('fs'),path=require('path');
const root=path.resolve(process.argv[2]||'.');
const R=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n');
const W=(f,s)=>fs.writeFileSync(path.join(root,f),s.replace(/\r\n/g,'\n'));
const rep=(f,a,b,label)=>{let s=R(f);if(!s.includes(a))throw Error('missing '+label+' in '+f);W(f,s.replace(a,b));};
const opt=(f,re,b)=>{let s=R(f);if(re.test(s))W(f,s.replace(re,b));};

const pkg=JSON.parse(R('package.json'));
pkg.name='ailis-personal';
pkg.version='1.4.8-local.1';
pkg.productName='AILIS Personal';
pkg.description='AILIS Personal - local-first anime desktop AI companion with optional cloud providers.';
W('package.json',JSON.stringify(pkg,null,2)+'\n');

rep('electron-builder.yml','appId: com.ailis.desktop','appId: com.ailis.personal','appId');
rep('electron-builder.yml','productName: AILIS','productName: AILIS Personal','productName');
rep('electron-builder.yml','  executableName: AILIS','  executableName: AILIS-Personal','executableName');
rep('electron-builder.yml','  ailisBundledAsr: true','  ailisBundledAsr: false','disable missing bundled ASR contract');
opt('electron-builder.yml',/extraResources:\n(?:  - from: build-cache\/ailis-wake-model[\s\S]*?\n(?=asar: true))/, 'asar: true\n', 'remove absent generated runtime packs');

rep('electron/desktop-llm-provider.cjs','const DEFAULT_PROVIDER = OPENAI_COMPATIBLE_PROVIDER;', "const DEFAULT_PROVIDER = 'ollama';",'default local LLM');

rep('electron/store.cjs',"const DEFAULT_LLM_PROVIDER = AILIS_CLOUD_PROVIDER;\nconst DEFAULT_LLM_BASE_URL = 'https://150.109.13.189/api/llm/v1';\nconst DEFAULT_LLM_MODEL = 'ailis-cloud';","const DEFAULT_LLM_PROVIDER = 'ollama';\nconst DEFAULT_LLM_BASE_URL = 'http://127.0.0.1:11434';\nconst DEFAULT_LLM_MODEL = 'qwen2.5:1.5b';",'store defaults');
rep('electron/store.cjs',"return provider === 'ailis-cloud' ? 'server' : provider === 'ollama' ? 'local' : 'direct';", "return provider === 'ailis-cloud' ? 'server' : ['ollama','vllm'].includes(provider) ? 'local' : 'direct';",'store local mode');

opt('src/control-panel-app.js',/const visibleProviders = Array\.from\(new Set\(\[\.\.\.providerOptions, 'ollama'\]\)\)\n\s*\.filter\(\(provider\) => provider !== 'vllm'\)/,"const visibleProviders = Array.from(new Set([...providerOptions, 'vllm', 'ollama']))");
opt('src/control-panel-app.js',/(\n\s*ollama: 'Ollama 本地')/,"$1,\n    vllm: 'vLLM 本地'");
opt('src/control-panel-app.js',/function isLocalLlmProvider\(provider = elements\.llmProvider\?\.value\) \{\n\s*return provider === 'ollama';\n\}/,"function isLocalLlmProvider(provider = elements.llmProvider?.value) {\n    return ['ollama','vllm'].includes(provider);\}");
opt('src/control-panel-app.js',/const rawLlmProvider = String\(preferences\.llmProvider \|\| 'ailis-cloud'\);\n\s*const normalizedLlmProvider = rawLlmProvider === 'vllm' \? 'ollama' : rawLlmProvider;/,"const rawLlmProvider = String(preferences.llmProvider || 'ollama').trim();\n    const normalizedLlmProvider = rawLlmProvider || 'ollama';");

W('LOCAL-FIRST.md','# AILIS Personal\n\nThe existing AILIS 1.4.8 anime VRM desktop companion remains intact. Ollama is the default local model runtime; vLLM and the existing OpenAI-compatible provider remain available for arbitrary local model IDs and local servers.\n');
W('BUILD-WINDOWS.md','# AILIS Personal Windows portable build\n\n    pnpm install --frozen-lockfile\n    pnpm build:desktop\n    pnpm exec electron-builder --win portable --config electron-builder.yml\n\nThe portable EXE contains the Electron/VRM desktop companion. Models are not bundled; configure Ollama, vLLM, or an OpenAI-compatible local endpoint after launch.\n');
console.log('portable patch applied');
