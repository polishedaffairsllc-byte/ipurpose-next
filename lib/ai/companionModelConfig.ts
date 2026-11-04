export const CURRENT_MENTOR_MODEL = "gpt-4o-mini";

export interface CompanionModelConfig {
  defaultModel: string;
  allowedModels: ReadonlySet<string>;
  maxInputCharacters: number;
  maxHistoryMessages: number;
  maxHistoryCharacters: number;
  maxOutputTokens: number;
}

export interface CompanionHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export function getCompanionModelConfig(
  environment: Record<string, string | undefined> = process.env
): CompanionModelConfig {
  const configuredDefault = environment.IPURPOSE_MENTOR_MODEL;
  if (configuredDefault && configuredDefault !== CURRENT_MENTOR_MODEL) {
    throw new Error('Unsupported generation model configuration. Configure gpt-4o-mini.');
  }

  const configuredAllowed = (environment.IPURPOSE_MENTOR_ALLOWED_MODELS || "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
  if (configuredAllowed.some(model => model !== CURRENT_MENTOR_MODEL)) {
    throw new Error('Unsupported generation model allowlist. Only gpt-4o-mini is approved.');
  }

  return {
    defaultModel: CURRENT_MENTOR_MODEL,
    allowedModels: new Set([CURRENT_MENTOR_MODEL]),
    maxInputCharacters: 4_000,
    maxHistoryMessages: 24,
    maxHistoryCharacters: 24_000,
    maxOutputTokens: 1_024,
  };
}

export function resolveCompanionModel(
  requestedModel?: string,
  environment: Record<string, string | undefined> = process.env
): string {
  const config = getCompanionModelConfig(environment);
  if (requestedModel !== undefined && !config.allowedModels.has(requestedModel)) {
    throw new Error('Unsupported generation model request. Only gpt-4o-mini is approved.');
  }
  return config.defaultModel;
}

export function boundCompanionHistory(
  messages: CompanionHistoryMessage[],
  maxCharacters = getCompanionModelConfig().maxHistoryCharacters
): CompanionHistoryMessage[] {
  const selected: CompanionHistoryMessage[] = [];
  let remainingCharacters = Math.max(0, maxCharacters);

  for (let index = messages.length - 1; index >= 0 && remainingCharacters > 0; index -= 1) {
    const { role, content } = messages[index];
    const boundedContent = content.slice(0, remainingCharacters);
    if (!boundedContent) continue;
    selected.push({ role, content: boundedContent });
    remainingCharacters -= boundedContent.length;
  }

  return selected.reverse();
}
