import "server-only";
import type {
  AbsoluAssistantProvider,
  AssistantRequest,
  AssistantResponse,
} from "./provider";

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

export class OpenAIResponsesProvider implements AbsoluAssistantProvider {
  readonly name = "openai";
  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY);
  }
  async complete(request: AssistantRequest): Promise<AssistantResponse> {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("AI_PROVIDER_NOT_CONFIGURED");
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_ASSISTANT_MODEL || "gpt-5.6-luna",
        store: false,
        safety_identifier: "absolu-admin-assistant",
        max_output_tokens: 500,
        text: { verbosity: "low" },
        instructions:
          "Tu es l’analyste hôtelier de Love Room Absolu. Réponds en français, de façon concise et premium. Utilise uniquement les indicateurs agrégés fournis. Ne prétends jamais modifier un tarif, une réservation ou une disponibilité. Signale qu’une recommandation reste à valider humainement.",
        input: `${request.prompt}\n\nIndicateurs agrégés : ${JSON.stringify(request.context ?? {})}`,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new Error(`OPENAI_HTTP_${response.status}`);
    const data = (await response.json()) as OpenAIResponse;
    const content =
      data.output_text?.trim() ||
      data.output
        ?.flatMap((item) => item.content ?? [])
        .find((item) => item.type === "output_text")
        ?.text?.trim();
    if (!content) throw new Error("OPENAI_EMPTY_RESPONSE");
    return { content, provider: this.name };
  }
}
