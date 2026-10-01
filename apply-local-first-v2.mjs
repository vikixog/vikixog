import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n');
const write = (rel, value) => fs.writeFileSync(path.join(root, rel), value.replace(/\r\n/g, '\n'));
const rep = (rel, pattern, replacement, required = true) => {
  const s = read(rel);
  if (!s.includes(pattern)) {
    if (required) throw new Error('Missing anchor: ' + rel + ' :: ' + pattern);
    return;
  }
  write(rel, s.replace(pattern, replacement));
};

const pkg = JSON.parse(read('package.json'));
pkg.name = 'ailis-personal';
pkg.version = '1.4.8-local.1';
pkg.description = 'AILIS Personal — local-first anime desktop AI companion with local and optional cloud AI providers.';
pkg.productName = 'AILIS Personal';
write('package.json', JSON.stringify(pkg, null, 2) + '\n');

rep('electron-builder.yml', 'appId: com.ailis.desktop', 'appId: com.ailis.personal');
rep('electron-builder.yml', 'productName: AILIS', 'productName: AILIS Personal');
rep('electron-builder.yml', '  executableName: AILIS', '  executableName: AILIS-Personal');

// Generic local OpenAI-compatible provider. Model id and endpoint are free-form.
rep('electron/desktop-llm-provider.cjs', "const OLLAMA_PROVIDER = 'ollama';", "const OLLAMA_PROVIDER = 'ollama';\nconst LOCAL_OPENAI_COMPATIBLE_PROVIDER = 'local-openai-compatible';");
rep('electron/desktop-llm-provider.cjs', "    VLLM_PROVIDER\n]);", "    VLLM_PROVIDER,\n    LOCAL_OPENAI_COMPATIBLE_PROVIDER\n]);");
rep('electron/desktop-llm-provider.cjs', "    OLLAMA_PROVIDER\n]);", "    OLLAMA_PROVIDER,\n    LOCAL_OPENAI_COMPATIBLE_PROVIDER\n]);");
rep('electron/desktop-llm-provider.cjs', "    [OLLAMA_PROVIDER]: 'http://127.0.0.1:11434'\n});", "    [OLLAMA_PROVIDER]: 'http://127.0.0.1:11434',\n    [LOCAL_OPENAI_COMPATIBLE_PROVIDER]: 'http://127.0.0.1:1234/v1'\n});");
rep('electron/desktop-llm-provider.cjs', "    [OLLAMA_PROVIDER]: 'qwen2.5:1.5b'\n});", "    [OLLAMA_PROVIDER]: 'qwen2.5:1.5b',\n    [LOCAL_OPENAI_COMPATIBLE_PROVIDER]: 'local-model'\n});");
rep('electron/desktop-llm-provider.cjs', "    [OLLAMA_PROVIDER]: Object.freeze({\n        provider: OLLAMA_PROVIDER,", "    [LOCAL_OPENAI_COMPATIBLE_PROVIDER]: createOpenAiCompatibleProviderCapabilities(\n        LOCAL_OPENAI_COMPATIBLE_PROVIDER,\n        'Generic Local OpenAI-compatible',\n        'Connect any local server exposing /v1/chat/completions, such as llama.cpp, LM Studio, vLLM, SGLang, or NVIDIA NIM. API key is optional.'\n    ),\n    [OLLAMA_PROVIDER]: Object.freeze({\n        provider: OLLAMA_PROVIDER,");
rep('electron/desktop-llm-provider.cjs', 'const DEFAULT_PROVIDER = OPENAI_COMPATIBLE_PROVIDER;', 'const DEFAULT_PROVIDER = OLLAMA_PROVIDER;');
rep('electron/desktop-llm-provider.cjs', 'return normalizeProvider(provider) === VLLM_PROVIDER;', "return [VLLM_PROVIDER, LOCAL_OPENAI_COMPATIBLE_PROVIDER].includes(normalizeProvider(provider));", false);
rep('electron/desktop-llm-provider.cjs', '        normalizedProvider !== OLLAMA_PROVIDER &&\n        normalizedProvider !== CODEX_MODEL_BRIDGE_PROVIDER;', '        normalizedProvider !== OLLAMA_PROVIDER &&\n        normalizedProvider !== LOCAL_OPENAI_COMPATIBLE_PROVIDER &&\n        normalizedProvider !== CODEX_MODEL_BRIDGE_PROVIDER;', false);
rep('electron/desktop-llm-provider.cjs', '    OLLAMA_PROVIDER,\n    VLLM_PROVIDER,', '    OLLAMA_PROVIDER,\n    LOCAL_OPENAI_COMPATIBLE_PROVIDER,\n    VLLM_PROVIDER,', false);

// Store: local-first defaults; keep cloud providers.
rep('electron/store.cjs', "const CODEX_MODEL_BRIDGE_PROVIDER = 'codex-model-bridge';", "const CODEX_MODEL_BRIDGE_PROVIDER = 'codex-model-bridge';\nconst LOCAL_OPENAI_COMPATIBLE_PROVIDER = 'local-openai-compatible';");
rep('electron/store.cjs', "    CODEX_MODEL_BRIDGE_PROVIDER,\n    'ollama'\n];", "    CODEX_MODEL_BRIDGE_PROVIDER,\n    'vllm',\n    'ollama',\n    LOCAL_OPENAI_COMPATIBLE_PROVIDER\n];");
rep('electron/store.cjs', "const DEFAULT_LLM_PROVIDER = AILIS_CLOUD_PROVIDER;\nconst DEFAULT_LLM_BASE_URL = 'https://150.109.13.189/api/llm/v1';\nconst DEFAULT_LLM_MODEL = 'ailis-cloud';", "const DEFAULT_LLM_PROVIDER = 'ollama';\nconst DEFAULT_LLM_BASE_URL = 'http://127.0.0.1:11434';\nconst DEFAULT_LLM_MODEL = 'qwen2.5:1.5b';");
rep('electron/store.cjs', "    ollama: 'http://127.0.0.1:11434'\n});", "    ollama: 'http://127.0.0.1:11434',\n    [LOCAL_OPENAI_COMPATIBLE_PROVIDER]: 'http://127.0.0.1:1234/v1'\n});");
rep('electron/store.cjs', "    ollama: 'qwen2.5:1.5b'\n});", "    ollama: 'qwen2.5:1.5b',\n    [LOCAL_OPENAI_COMPATIBLE_PROVIDER]: 'local-model'\n});");
rep('electron/store.cjs', "return provider === 'ailis-cloud' ? 'server' : provider === 'ollama' ? 'local' : 'direct';", "return provider === 'ailis-cloud' ? 'server' : ['ollama', 'vllm', LOCAL_OPENAI_COMPATIBLE_PROVIDER].includes(provider) ? 'local' : 'direct';");
rep('electron/store.cjs', "    normalizedState.preferences.llmProvider = legacyLlmProvider === 'vllm'\n        ? 'ollama'\n        : normalizeLlmProvider(normalizedState.preferences.llmProvider);", "    normalizedState.preferences.llmProvider = normalizeLlmProvider(normalizedState.preferences.llmProvider);");
rep('electron/store.cjs', "    normalizedState.preferences.llmBaseUrl = normalizeLlmBaseUrl(\n        legacyLlmProvider === 'vllm'\n            ? LLM_PROVIDER_DEFAULT_BASE_URLS.ollama\n            : normalizedState.preferences.llmBaseUrl\n    );", "    normalizedState.preferences.llmBaseUrl = normalizeLlmBaseUrl(normalizedState.preferences.llmBaseUrl);");
rep('electron/store.cjs', "    normalizedState.preferences.llmModel = normalizeLlmModel(\n        legacyLlmProvider === 'vllm'\n            ? LLM_PROVIDER_DEFAULT_MODELS.ollama\n            : normalizedState.preferences.llmModel\n    );", "    normalizedState.preferences.llmModel = normalizeLlmModel(normalizedState.preferences.llmModel);");

// Main: display provider and classify it as local.
rep('electron/main.cjs', "        gemini: 'Gemini',\n        ollama: 'Ollama'\n    }", "        gemini: 'Gemini',\n        vllm: 'vLLM',\n        ollama: 'Ollama',\n        'local-openai-compatible': 'Local OpenAI-compatible'\n    }");
rep('electron/main.cjs', "if (normalizedProvider === 'vllm') {", "if (normalizedProvider === 'vllm' || normalizedProvider === 'local-openai-compatible') {");
rep('electron/main.cjs', "return normalizedProvider === 'ollama' || normalizedProvider === 'vllm';", "return normalizedProvider === 'ollama' || normalizedProvider === 'vllm' || normalizedProvider === 'local-openai-compatible';");

// Agent: generic local provider counts as local.
rep('electron/agent-loop/runner.cjs', "    return normalizedProvider === 'vllm' ||\n        normalizedProvider === 'ollama' ||", "    return normalizedProvider === 'vllm' ||\n        normalizedProvider === 'ollama' ||\n        normalizedProvider === 'local-openai-compatible' ||");

// UI: show all local providers and do not collapse vLLM.
rep('src/control-panel-app.js', "const visibleProviders = Array.from(new Set([...providerOptions, 'ollama']))\n        .filter((provider) => provider !== 'vllm')", "const visibleProviders = Array.from(new Set([...providerOptions, 'vllm', 'ollama', 'local-openai-compatible']))", false);
rep('src/control-panel-app.js', "const rawLlmProvider = String(preferences.llmProvider || 'ailis-cloud');\n    const normalizedLlmProvider = rawLlmProvider === 'vllm' ? 'ollama' : rawLlmProvider;", "const rawLlmProvider = String(preferences.llmProvider || 'ollama').trim();\n    const normalizedLlmProvider = rawLlmProvider || 'ollama';", false);

console.log('AILIS Personal build patch applied successfully.');
