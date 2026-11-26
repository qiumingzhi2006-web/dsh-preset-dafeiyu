import schemastery from "@deepseek-ai/schemastery";
import { EntryGroup } from "@deepseek-ai/cordis-plugin-loader";
import Preset from "@deepseek-ai/dsh-agent-preset";

/**
 * 大肥鱼 Agent 预设。
 *
 * 人格注入由本包自带的 ./persona 插件完成（见 lib/persona.js），
 * 不再引用 dsh-xiaomi-tts 等外部插件包的子路径，所以单独启用本预设
 * 就能完整工作；外部插件开关不会再让这张卡片变红。
 */

const PERSONA_PLUGIN_NAME = "dsh-preset-dafeiyu/persona";
const PERSONA_PLUGIN_ID = "dafeiyu-persona";

/** 历史配置里可能残留的外部插件（语音工坊等），一律过滤掉。 */
const FOREIGN_PREFIXES = ["dsh-xiaomi-tts/", "dsh-xiaomi-tts"];
const FOREIGN_IDS = new Set(["qq-persona", "speech-agent"]);

function pick(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

/** 把 persona 各字段拼成一段完整的人格文本。 */
export function composePersonaText(persona) {
  if (!persona) return "";
  if (typeof persona === "string") return persona.trim();

  const name = pick(persona.name) || "大肥鱼";
  const sections = [`【人格：${name}】`];

  if (pick(persona.relationship)) {
    sections.push(`你与对方的关系：${pick(persona.relationship)}`);
  }
  const selfReference = pick(persona.selfReference);
  const userAddress = pick(persona.userAddress);
  if (selfReference || userAddress) {
    sections.push(
      `自称：${selfReference || "我"}；对对方的称呼：${userAddress || "你"}`,
    );
  }
  if (pick(persona.personality)) sections.push(pick(persona.personality));
  if (pick(persona.replyStyle)) sections.push(`【回复风格】\n${pick(persona.replyStyle)}`);
  if (pick(persona.likes)) sections.push(`【喜好】\n${pick(persona.likes)}`);
  if (pick(persona.boundaries)) sections.push(pick(persona.boundaries));

  return sections.join("\n\n").trim();
}

function isForeignPlugin(entry) {
  if (!entry || typeof entry !== "object") return true;
  const id = pick(entry.id);
  const name = pick(entry.name);
  if (FOREIGN_IDS.has(id)) return true;
  if (!name) return true;
  return FOREIGN_PREFIXES.some((prefix) => name === prefix || name.startsWith(prefix));
}

class DafeiyuPreset {
  static inject = ["agentPresets"];
  static [EntryGroup.key] = true;
  static Config = schemastery.object({
    id: schemastery.string().required(),
    name: schemastery.string(),
    description: schemastery.string(),
    order: schemastery.number(),
    plugins: schemastery.array(schemastery.any()).required(),
    persona: schemastery.any(),
    memory: schemastery.any(),
    memes: schemastery.any(),
  });

  constructor(ctx, config) {
    const { persona, memory, memes, plugins, ...rest } = config;

    // 只保留本包自己能解析的插件条目，再把人格注入插件排在最前。
    const ownPlugins = (Array.isArray(plugins) ? plugins : []).filter(
      (entry) => !isForeignPlugin(entry),
    );

    const personaText = composePersonaText(persona);
    const finalPlugins = personaText
      ? [
          {
            id: PERSONA_PLUGIN_ID,
            name: PERSONA_PLUGIN_NAME,
            config: { text: personaText },
          },
          ...ownPlugins,
        ]
      : ownPlugins;

    ctx.plugin(Preset, { ...rest, plugins: finalPlugins });
  }
}

export default DafeiyuPreset;
