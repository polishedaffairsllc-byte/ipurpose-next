const CURRENT_MENTOR_MODEL = "gpt-4o-mini";
const MODEL_ID_PATTERN = /^[a-zA-Z0-9._:-]+$/;

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

function validModelId(value: string | undefined): value is string {
  return Boolean(value && MODEL_ID_PATTERN.test(value));
}

export function getCompanionModelConfig(
  environment: Record<string, string | undefined> = process.env
): CompanionModelConfig {
  const configuredDefault = environment.IPURPOSE_MENTOR_MODEL;
  const defaultModel = validModelId(configuredDefault)
    ? configuredDefault
    : CURRENT_MENTOR_MODEL;

  const configuredAllowed = (environment.IPURPOSE_MENTOR_ALLOWED_MODELS || "")
    .split(",")
    .map((model) => model.trim())
    .filter(validModelId);

  return {
    defaultModel,
    allowedModels: new Set([CURRENT_MENTOR_MODEL, defaultModel, ...configuredAllowed]),
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
  return requestedModel && config.allowedModels.has(requestedModel)
    ? requestedModel
    : config.defaultModel;
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
