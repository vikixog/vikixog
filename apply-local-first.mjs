import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
if (!fs.existsSync(path.join(root, 'package.json'))) throw new Error(`Not an AILIS checkout: ${root}`);

const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, text) => {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
};
const must = (rel, oldText, newText) => {
  let s = read(rel);
  if (!s.includes(oldText)) throw new Error(`Patch anchor not found in ${rel}: ${oldText.slice(0,120)}`);
  write(rel, s.replace(oldText, newText));
};
const mustRegex = (rel, re, replacement) => {
  let s = read(rel);
  if (!re.test(s)) throw new Error(`Patch regex not found in ${rel}: ${re}`);
  write(rel, s.replace(re, replacement));
};

const pkg = JSON.parse(read('package.json'));
pkg.name = 'ailis-personal';
pkg.version = '1.4.8-local.1';
pkg.description = 'AILIS Personal — local-first anime desktop AI companion with configurable cloud providers.';
pkg.productName = 'AILIS Personal';
write('package.json', JSON.stringify(pkg, null, 2) + '\n');

must('electron-builder.yml', 'appId: com.ailis.desktop', 'appId: com.ailis.personal');
must('electron-builder.yml', 'productName: AILIS', 'productName: AILIS Personal');
must('electron-builder.yml', 'executableName: AILIS', 'executableName: AILIS-Personal');

must('electron/desktop-llm-provider.cjs', "const DEFAULT_PROVIDER = OPENAI_COMPATIBLE_PROVIDER;", '');
must('electron/desktop-llm-provider.cjs', "const OLLAMA_PROVIDER = 'ollama';\n", "const OLLAMA_PROVIDER = 'ollama';\nconst LOCAL_OPENAI_COMPATIBLE_PROVIDER = 'local-openai-compatible';\nconst DEFAULT_PROVIDER = OLLAMA_PROVIDER;\n");
must('electron/desktop-llm-provider.cjs', "    VLLM_PROVIDER\n]);", "    VLLM_PROVIDER,\n    LOCAL_OPENAI_COMPATIBLE_PROVIDER\n]);");
must('electron/desktop-llm-provider.cjs', "    VLLM_PROVIDER,\n    OLLAMA_PROVIDER\n]);", "    VLLM_PROVIDER,\n    OLLAMA_PROVIDER,\n    LOCAL_OPENAI_COMPATIBLE_PROVIDER\n]);");
must('electron/desktop-llm-provider.cjs', "    [OLLAMA_PROVIDER]: 'http://127.0.0.1:11434'\n});", "    [OLLAMA_PROVIDER]: 'http://127.0.0.1:11434',\n    [LOCAL_OPENAI_COMPATIBLE_PROVIDER]: 'http://127.0.0.1:1234/v1'\n});");
must('electron/desktop-llm-provider.cjs', "    [OLLAMA_PROVIDER]: 'qwen2.5:1.5b'\n});", "    [OLLAMA_PROVIDER]: 'qwen2.5:1.5b',\n    [LOCAL_OPENAI_COMPATIBLE_PROVIDER]: 'local-model'\n});");
must('electron/desktop-llm-provider.cjs',
  "        notes: '本地 Ollama 使用 /api/chat；API Key 留空。多模态能力取决于本地模型。'\n    })\n});",
  "        notes: '本地 Ollama 使用 /api/chat；API Key 留空。多模态能力取决于本地模型。'\n    }),\n    [LOCAL_OPENAI_COMPATIBLE_PROVIDER]: Object.freeze({\n        provider: LOCAL_OPENAI_COMPATIBLE_PROVIDER,\n        label: 'Local OpenAI-compatible Server',\n        transport: 'chat-completions',\n        chat: true,\n        nativeToolCalling: 'model-dependent',\n        nativeToolCallingDefault: false,\n        jsonMode: 'model-dependent',\n        jsonSchema: 'model-dependent',\n        vision: 'model-dependent',\n        longContext: 'model-dependent',\n        lowLatency: 'model-dependent',\n        notes: '通用本地适配器：连接任何提供 OpenAI-compatible /v1/chat/completions 的本地服务器，例如 llama.cpp、LM Studio、vLLM、SGLang、NVIDIA NIM 或其他兼容网关。模型 ID 直接使用服务器的 /v1/models 或运行时文档中的 ID。API Key 可留空。'\n    })\n});");
must('electron/desktop-llm-provider.cjs', "return normalizeProvider(provider) === VLLM_PROVIDER;", "return [VLLM_PROVIDER, LOCAL_OPENAI_COMPATIBLE_PROVIDER].includes(normalizeProvider(provider));");
must('electron/desktop-llm-provider.cjs', '|kimi.*vision|llava|bakllava|moondream)', '|kimi.*vision|llava|bakllava|moondream|minicpm[-_]?v|internvl|pixtral|phi-3.*vision)');
must('electron/desktop-llm-provider.cjs',
  '/(vision|vl|omni|gpt-4o|gpt-4\\.1|gpt-5|o3|o4|claude-3|gemini|qwen.*vl|glm-4v|doubao.*vision|seed.*vision|kimi.*vision|llava|bakllava|moondream|minicpm[-_]?v|internvl|pixtral|phi-3.*vision)/i',
  '/(vision|\\bvl\\b|omni|gpt-4o|gpt-4\\.1|gpt-5|o3|o4|claude-3|gemini|qwen.*vl|qwen.*omni|glm-4v|doubao.*vision|seed.*vision|kimi.*vision|llava|bakllava|moondream|minicpm[-_]?v|internvl|pixtral|phi-3.*vision)/i');
must('electron/desktop-llm-provider.cjs', "        normalizedProvider !== OLLAMA_PROVIDER &&\n        normalizedProvider !== CODEX_MODEL_BRIDGE_PROVIDER;", "        normalizedProvider !== OLLAMA_PROVIDER &&\n        normalizedProvider !== LOCAL_OPENAI_COMPATIBLE_PROVIDER &&\n        normalizedProvider !== CODEX_MODEL_BRIDGE_PROVIDER;");
must('electron/desktop-llm-provider.cjs', 'if (options.includeToolCall !== false && capabilities.nativeToolCalling) {', "if (options.includeToolCall !== false && (capabilities.nativeToolCalling === true || capabilities.nativeToolCalling === 'model-dependent')) {");
must('electron/desktop-llm-provider.cjs', "reason: 'provider_capability_table_marks_tool_calling_unavailable'", "reason: 'provider_capability_table_marks_tool_calling_unavailable_or_unverified'");
must('electron/desktop-llm-provider.cjs', "    OLLAMA_PROVIDER,\n    OPENAI_COMPATIBLE_PROVIDER,", "    OLLAMA_PROVIDER,\n    LOCAL_OPENAI_COMPATIBLE_PROVIDER,\n    OPENAI_COMPATIBLE_PROVIDER,");

must('electron/store.cjs', "const CODEX_MODEL_BRIDGE_PROVIDER = 'codex-model-bridge';\n", "const CODEX_MODEL_BRIDGE_PROVIDER = 'codex-model-bridge';\nconst LOCAL_OPENAI_COMPATIBLE_PROVIDER = 'local-openai-compatible';\n");
must('electron/store.cjs', "    CODEX_MODEL_BRIDGE_PROVIDER,\n    'ollama'\n];", "    CODEX_MODEL_BRIDGE_PROVIDER,\n    'vllm',\n    'ollama',\n    LOCAL_OPENAI_COMPATIBLE_PROVIDER\n];");
must('electron/store.cjs', "const DEFAULT_LLM_PROVIDER = AILIS_CLOUD_PROVIDER;\nconst DEFAULT_LLM_BASE_URL = 'https://150.109.13.189/api/llm/v1';\nconst DEFAULT_LLM_MODEL = 'ailis-cloud';", "// Local-first fork: Ollama is the default, while AILIS Cloud/OpenAI/Claude/Gemini remain available.\nconst DEFAULT_LLM_PROVIDER = 'ollama';\nconst DEFAULT_LLM_BASE_URL = 'http://127.0.0.1:11434';\nconst DEFAULT_LLM_MODEL = 'qwen2.5:1.5b';");
must('electron/store.cjs', "    [AILIS_CLOUD_PROVIDER]: DEFAULT_LLM_BASE_URL,", "    [AILIS_CLOUD_PROVIDER]: 'https://150.109.13.189/api/llm/v1',");
must('electron/store.cjs', "    ollama: 'http://127.0.0.1:11434'\n});", "    ollama: 'http://127.0.0.1:11434',\n    [LOCAL_OPENAI_COMPATIBLE_PROVIDER]: 'http://127.0.0.1:1234/v1'\n});");
must('electron/store.cjs', "    [AILIS_CLOUD_PROVIDER]: DEFAULT_LLM_MODEL,", "    [AILIS_CLOUD_PROVIDER]: 'ailis-cloud',");
must('electron/store.cjs', "    ollama: 'qwen2.5:1.5b'\n});", "    ollama: 'qwen2.5:1.5b',\n    [LOCAL_OPENAI_COMPATIBLE_PROVIDER]: 'local-model'\n});");
must('electron/store.cjs', "return provider === 'ailis-cloud' ? 'server' : provider === 'ollama' ? 'local' : 'direct';", "return provider === 'ailis-cloud'\n        ? 'server'\n        : ['ollama', 'vllm', LOCAL_OPENAI_COMPATIBLE_PROVIDER].includes(provider)\n            ? 'local'\n            : 'direct';");
mustRegex('electron/store.cjs', /baseUrl: DEFAULT_LLM_BASE_URL,\n\s+model: DEFAULT_LLM_MODEL/g, 'baseUrl: LLM_PROVIDER_DEFAULT_BASE_URLS[AILIS_CLOUD_PROVIDER],\n                  model: LLM_PROVIDER_DEFAULT_MODELS[AILIS_CLOUD_PROVIDER]');
must('electron/store.cjs', "                llmBaseUrl: DEFAULT_LLM_BASE_URL,\n                llmModel: DEFAULT_LLM_MODEL", "                llmBaseUrl: LLM_PROVIDER_DEFAULT_BASE_URLS.ollama,\n                llmModel: LLM_PROVIDER_DEFAULT_MODELS.ollama");
must('electron/store.cjs', "            llmBaseUrl: DEFAULT_LLM_BASE_URL,\n            llmModel: DEFAULT_LLM_MODEL,", "            llmBaseUrl: LLM_PROVIDER_DEFAULT_BASE_URLS.ollama,\n            llmModel: LLM_PROVIDER_DEFAULT_MODELS.ollama,");
must('electron/store.cjs',
  "    normalizedState.preferences.llmProvider = legacyLlmProvider === 'vllm'\n        ? 'ollama'\n        : normalizeLlmProvider(normalizedState.preferences.llmProvider);\n    normalizedState.preferences.llmBaseUrl = normalizeLlmBaseUrl(\n        legacyLlmProvider === 'vllm'\n            ? LLM_PROVIDER_DEFAULT_BASE_URLS.ollama\n            : normalizedState.preferences.llmBaseUrl\n    );",
  "    normalizedState.preferences.llmProvider = normalizeLlmProvider(\n        normalizedState.preferences.llmProvider || legacyLlmProvider\n    );\n    if (legacyLlmProvider === 'vllm' && !normalizedState.preferences.llmBaseUrl) {\n        normalizedState.preferences.llmBaseUrl = LLM_PROVIDER_DEFAULT_BASE_URLS.vllm;\n    }");
must('electron/store.cjs', "        legacyLlmProvider === 'vllm'\n            ? LLM_PROVIDER_DEFAULT_MODELS.ollama\n            : normalizedState.preferences.llmModel", "        normalizedState.preferences.llmModel");
must('electron/store.cjs', "        normalizedState.preferences.llmBaseUrl = DEFAULT_LLM_BASE_URL;\n        normalizedState.preferences.llmModel = DEFAULT_LLM_MODEL;", "        normalizedState.preferences.llmBaseUrl = LLM_PROVIDER_DEFAULT_BASE_URLS[AILIS_CLOUD_PROVIDER] || 'https://150.109.13.189/api/llm/v1';\n        normalizedState.preferences.llmModel = LLM_PROVIDER_DEFAULT_MODELS[AILIS_CLOUD_PROVIDER] || 'ailis-cloud';");

must('electron/main.cjs', "        gemini: 'Gemini',\n        ollama: 'Ollama'\n    }", "        gemini: 'Gemini',\n        vllm: 'vLLM',\n        ollama: 'Ollama',\n        'local-openai-compatible': 'Local OpenAI-compatible'\n    }");
must('electron/main.cjs', "    if (normalizedProvider === 'vllm') {", "    if (normalizedProvider === 'vllm' || normalizedProvider === 'local-openai-compatible') {");
must('electron/main.cjs', "            process.env.AILIS_VLLM_API_KEY ||\n                ''", "            process.env.AILIS_VLLM_API_KEY ||\n                process.env.LOCAL_LLM_API_KEY ||\n                process.env.AILIS_LOCAL_LLM_API_KEY ||\n                ''");
must('electron/main.cjs', "return normalizedProvider === 'ollama' || normalizedProvider === 'vllm';", "return normalizedProvider === 'ollama' || normalizedProvider === 'vllm' || normalizedProvider === 'local-openai-compatible';");

must('electron/agent-loop/runner.cjs', "    return normalizedProvider === 'vllm' ||\n        normalizedProvider === 'ollama' ||\n        normalizedProvider === 'codex-model-bridge';", "    return normalizedProvider === 'vllm' ||\n        normalizedProvider === 'ollama' ||\n        normalizedProvider === 'local-openai-compatible' ||\n        normalizedProvider === 'codex-model-bridge';");

must('src/control-panel-app.js', "    'codex-model-bridge': 'Codex Luna（本机订阅桥）',\n    ollama: 'Ollama 本地'", "    'codex-model-bridge': 'Codex Luna（本机订阅桥）',\n    ollama: 'Ollama 本地',\n    vllm: 'vLLM 本地',\n    'local-openai-compatible': '通用本地 OpenAI-compatible'");
must('src/control-panel-app.js', "    'codex-model-bridge': 'codex://chatgpt-oauth',\n    ollama: 'http://127.0.0.1:11434'", "    'codex-model-bridge': 'codex://chatgpt-oauth',\n    ollama: 'http://127.0.0.1:11434',\n    vllm: 'http://127.0.0.1:8000/v1',\n    'local-openai-compatible': 'http://127.0.0.1:1234/v1'");
must('src/control-panel-app.js', "    'codex-model-bridge': 'gpt-5.6-luna',\n    ollama: 'qwen2.5:1.5b'", "    'codex-model-bridge': 'gpt-5.6-luna',\n    ollama: 'qwen2.5:1.5b',\n    vllm: 'Qwen/Qwen2.5-7B-Instruct',\n    'local-openai-compatible': 'local-model'");
must('src/control-panel-app.js', "    {\n        id: 'ollama',", "    {\n        id: 'vllm',\n        label: 'vLLM 本地',\n        help: '通过 OpenAI-compatible /v1 接口连接本机 vLLM。模型 ID 使用 vLLM 当前暴露的 served model name。',\n        provider: 'vllm',\n        baseUrl: 'http://127.0.0.1:8000/v1',\n        models: [\n            { id: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen 7B（示例）' },\n            { id: 'mistralai/Mistral-7B-Instruct-v0.3', label: 'Mistral 7B（示例）' }\n        ]\n    },\n    {\n        id: 'local-openai-compatible',\n        label: '通用本地 OpenAI-compatible',\n        help: '只要本地服务提供 /v1/chat/completions，就可以连接。可用于 llama.cpp、LM Studio、vLLM、SGLang、NVIDIA NIM 以及其他 OpenAI-compatible 本地服务器。',\n        provider: 'local-openai-compatible',\n        baseUrl: 'http://127.0.0.1:1234/v1',\n        models: []\n    },\n    {\n        id: 'ollama',");
must('src/control-panel-app.js', "    return provider === 'ollama';", "    return ['ollama', 'vllm', 'local-openai-compatible'].includes(provider);");
must('src/control-panel-app.js', "    const rawLlmProvider = String(preferences.llmProvider || 'ailis-cloud');\n    const normalizedLlmProvider = rawLlmProvider === 'vllm' ? 'ollama' : rawLlmProvider;", "    const rawLlmProvider = String(preferences.llmProvider || 'ollama').trim();\n    const normalizedLlmProvider = rawLlmProvider || 'ollama';");
must('src/control-panel-app.js',
  "    const normalizedLlmBaseUrl = rawLlmProvider === 'vllm'\n        ? fallbackLlmProviderDefaultBaseUrls.ollama\n        : normalizedLlmProvider === 'ailis-cloud'\n            ? fallbackLlmProviderDefaultBaseUrls['ailis-cloud']\n            : String(preferences.llmBaseUrl || 'https://ark.cn-beijing.volces.com/api/v3');\n    const normalizedLlmModel = rawLlmProvider === 'vllm'\n        ? fallbackLlmProviderDefaultModels.ollama\n        : normalizedLlmProvider === 'ailis-cloud'\n            ? fallbackLlmProviderDefaultModels['ailis-cloud']\n            : String(preferences.llmModel || 'doubao-seed-2-0-mini-260215');",
  "    const normalizedLlmBaseUrl = normalizedLlmProvider === 'ailis-cloud'\n        ? fallbackLlmProviderDefaultBaseUrls['ailis-cloud']\n        : String(preferences.llmBaseUrl || fallbackLlmProviderDefaultBaseUrls[normalizedLlmProvider] || fallbackLlmProviderDefaultBaseUrls.ollama);\n    const normalizedLlmModel = normalizedLlmProvider === 'ailis-cloud'\n        ? fallbackLlmProviderDefaultModels['ailis-cloud']\n        : String(preferences.llmModel || fallbackLlmProviderDefaultModels[normalizedLlmProvider] || fallbackLlmProviderDefaultModels.ollama);");
must('src/control-panel-app.js', "const visibleProviders = Array.from(new Set([...providerOptions, 'ollama']))\n        .filter((provider) => provider !== 'vllm')", "const visibleProviders = Array.from(new Set([...providerOptions, 'vllm', 'ollama', 'local-openai-compatible']))");
must('src/control-panel-app.js', "const visibleProviders = Array.from(new Set([...providerOptions, 'ollama']))\n        .filter((provider) => provider !== 'vllm')", "const visibleProviders = Array.from(new Set([...providerOptions, 'vllm', 'ollama', 'local-openai-compatible']))");
must('src/control-panel-app.js', "function getLocalLlmSetupHelp(provider = elements.llmProvider?.value) {\n    if (provider === 'ollama') {", "function getLocalLlmSetupHelp(provider = elements.llmProvider?.value) {\n    if (provider === 'vllm') {\n        return 'vLLM 本地模式：API Base 填写 vLLM 的 /v1 地址，例如 http://127.0.0.1:8000/v1；模型 ID 使用 served model name。';\n    }\n    if (provider === 'local-openai-compatible') {\n        return '通用本地模式：API Base 填写本地 OpenAI-compatible 服务的 /v1 地址。适用于 llama.cpp、LM Studio、vLLM、SGLang、NVIDIA NIM 等。API Key 可留空。';\n    }\n    if (provider === 'ollama') {");
must('src/control-panel-app.js', "elements.llmModelCard.hidden = provider === 'ollama';", "elements.llmModelCard.hidden = false;");
must('src/control-panel-app.js', "elements.localLlmRuntimeTitle.textContent = 'Ollama 本地模型运行时';", "elements.localLlmRuntimeTitle.textContent = provider === 'ollama' ? 'Ollama 本地模型运行时' : '通用本地模型运行时';");
must('src/control-panel-app.js', "elements.localLlmRuntimeCopy.textContent =\n            '当前选择的是 Ollama。选择模型来源后，AILIS 会按该来源检查、部署并启用。';", "elements.localLlmRuntimeCopy.textContent = provider === 'ollama'\n            ? '选择 Ollama 模型来源后，AILIS 会按该来源检查、部署并启用。'\n            : provider === 'vllm'\n                ? 'vLLM 负责加载模型，AILIS 通过 OpenAI-compatible 接口统一调用。'\n                : '连接任何兼容 OpenAI Chat Completions 的本地服务器；模型家族不在 AILIS 中写死。';");
must('src/control-panel-app.js', "    return provider === 'ailis-cloud' ? 'server' : provider === 'ollama' ? 'local' : 'direct';", "    return provider === 'ailis-cloud' ? 'server' : ['ollama', 'vllm', 'local-openai-compatible'].includes(provider) ? 'local' : 'direct';");

must('control.html', '日常对话优先选低延迟模型；复杂任务再选更强的 Pro/Max/Sonnet 类模型。', '本地模式不限制模型家族：Qwen、Mistral、Llama、Gemma、DeepSeek、MiniCPM 等可通过 Ollama、vLLM 或任意兼容 OpenAI 的本地服务器使用。');
must('control.html', '本地模型：选择 Ollama 后，AILIS 会引导自动诊断、部署并启用。', '本地模型支持 Ollama、vLLM，以及任意 OpenAI-compatible 本地服务器；模型 ID 不做家族白名单限制。');

write('LOCAL-FIRST.md', '# AILIS Personal — Local-first fork\n\nThis fork preserves the AILIS 1.4.8 anime desktop companion and makes Ollama the default LLM provider while retaining AILIS Cloud, OpenAI, Claude, Gemini, OpenAI-compatible providers, and ElevenLabs.\n\n## Local runtimes\n\n- Ollama: http://127.0.0.1:11434\n- vLLM: http://127.0.0.1:8000/v1\n- Generic OpenAI-compatible: http://127.0.0.1:1234/v1\n\nThe model ID is free-form. The chosen runtime decides which model families it can load. Qwen, Mistral, Llama, Gemma, DeepSeek, MiniCPM and NVIDIA-served models can be used when supported by the selected runtime.\n\n## Desktop companion\n\nThe transparent VRM pet, avatar animation/expression system, dialogue bubble, chat window, control panel, memory, agent tools, speech/lip-sync paths, and local runtime managers remain part of the Electron application.\n');
write('LOCAL-MODEL-COMPATIBILITY.md', '# AILIS Personal — Local Model Compatibility\n\nAILIS Personal deliberately does not maintain a brittle local-model whitelist. The common agent interface sends the selected model ID to the chosen local runtime.\n\nSupported connection styles: Ollama, vLLM, and generic OpenAI-compatible servers such as llama.cpp/llama-server, LM Studio, SGLang, NVIDIA NIM, or another compatible gateway.\n\nVision, tools, structured output, reasoning controls, and context length remain dependent on the selected model and runtime.\n');
write('BUILD-WINDOWS.md', '# Windows portable build\n\nNode.js 22 + pnpm 10.33 are used for the build.\n\n    pnpm install --frozen-lockfile\n    pnpm build:desktop\n    pnpm exec electron-builder --win portable --config electron-builder.yml\n\nOutput: release/AILIS Personal-1.4.8-local.1-Portable-win-x64.exe\n');
write('scripts/build-windows-local-first.ps1', '$ErrorActionPreference = \'Stop\'\npnpm install --frozen-lockfile\npnpm build:desktop\npnpm exec electron-builder --win portable --config electron-builder.yml\nGet-ChildItem .\\release | Select-Object Name, Length\n');
console.log(`AILIS Personal patch applied successfully to ${root}`);
