import schemastery from "@deepseek-ai/schemastery";

/**
 * 大肥鱼人格注入插件（本包自带，不依赖任何第三方插件包）。
 *
 * 它只使用 DSH 官方提供的 systemPrompt 服务：在系统提示词里注册一个
 * 顶层小节，把预设配置里的 persona 文本原样注入。设置里的 persona 段
 * 有任何改动，下一次新建会话即生效；旧会话重新开启也会读到新文本。
 */

/** 小节名固定，重复注册会覆盖同名小节。 */
export const PERSONA_SECTION_NAME = "preset-dafeiyu:persona";

/** 人格小节排在最前面，位于其他部署级提示词之前。 */
export const PERSONA_SECTION_ORDER = 0;

/** 语音使用说明小节（不依赖语音插件，插件不在时这段说明也说不出问题）。 */
export const SPEECH_SECTION_NAME = "preset-dafeiyu:speech";
export const SPEECH_SECTION_ORDER = 310;

const SPEECH_GUIDE = [
  "【语音】",
  "如果当前环境提供 speak 工具：用户明确要求语音、或已开启自动语音时，直接调用 speak，把要说的正文放进 text，不要先发文字铺垫；",
  "user 要求换语气、情绪、方言时同时传 speechInstruction。普通聊天照常用文字回复，不要自行朗读。",
  "没有 speak 工具时忽略本节，正常文字回复即可。",
].join("\n");

class DafeiyuPersona {
  static inject = ["systemPrompt"];

  static Config = schemastery.object({
    /** 由预设入口把 persona 各字段拼装好的完整文本。 */
    text: schemastery.string().required(),
    /** 是否附带语音使用说明，缺省视为开启。 */
    speechGuide: schemastery.boolean(),
  });

  constructor(ctx, config) {
    const text = String(config?.text ?? "").trim();
    if (!text) return;

    // 老版本 cordis 用 ctx.get 取服务，新版本可以直接访问 ctx.systemPrompt。
    const systemPrompt = ctx.get?.("systemPrompt") ?? ctx.systemPrompt;
    if (!systemPrompt || typeof systemPrompt.section !== "function") return;

    systemPrompt.section({
      name: PERSONA_SECTION_NAME,
      order: PERSONA_SECTION_ORDER,
      interpolate: false,
      text: () => text,
    });

    if (config?.speechGuide !== false) {
      systemPrompt.section({
        name: SPEECH_SECTION_NAME,
        order: SPEECH_SECTION_ORDER,
        interpolate: false,
        text: () => SPEECH_GUIDE,
      });
    }
  }
}

export default DafeiyuPersona;
