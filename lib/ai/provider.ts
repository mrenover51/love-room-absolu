export type AssistantIntent = "revenue_month" | "occupancy" | "best_month" | "promotion" | "email" | "customer_reply" | "business_analysis";
export type AssistantRequest = { intent: AssistantIntent; prompt: string; context?: Record<string, unknown> };
export type AssistantResponse = { content: string; provider: string };
export interface AbsoluAssistantProvider { readonly name: string; isConfigured(): boolean; complete(request: AssistantRequest): Promise<AssistantResponse> }
export class DisabledAssistantProvider implements AbsoluAssistantProvider { readonly name="disabled"; isConfigured(){return false} async complete():Promise<AssistantResponse>{throw new Error("AI_PROVIDER_NOT_CONFIGURED")} }
