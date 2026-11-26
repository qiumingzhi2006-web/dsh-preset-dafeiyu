import schemastery from "@deepseek-ai/schemastery";
import { EntryGroup } from "@deepseek-ai/cordis-plugin-loader";
import Preset from "@deepseek-ai/dsh-agent-preset";

// 人格字段在这里只是为了让配置里的 persona / memory / memes 段能通过校验，
// 真正的注入由插件列表里的 agent 插件完成，所以这里不需要依赖具体实现包。
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
    const { persona, memory, memes, ...rest } = config;
    ctx.plugin(Preset, rest);
  }
}

export default DafeiyuPreset;
