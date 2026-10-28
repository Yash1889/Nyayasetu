/**
 * NyayaSetu — Server-only environment validation.
 *
 * Import this module ONLY from server-side files (API routes, engine modules).
 * It must never be imported by any file in the `app/` client bundle.
 *
 * Security guarantee: GROQ_API_KEY and GEMINI_API_KEY are typed as
 * server-only. Next.js will throw a build error if they are referenced
 * in client components (i.e. files without 'use server' directive or
 * outside the /api or /lib/engine directories).
 */

export type LLMProvider = "groq" | "gemini" | "deterministic";

export interface ProviderConfig {
  provider: LLMProvider;
  model: string;
  apiKey: string | undefined;
  isConfigured: boolean;
  groqEndpoint: string;
  geminiEndpoint: string;
}

/**
 * Validated, server-only provider configuration.
 * Reads from process.env (populated by .env.local at runtime).
 * Never returns raw API keys to callers — only isConfigured flag.
 */
export function resolveProviderConfig(): ProviderConfig {
  const rawProvider = (process.env.LLM_PROVIDER ?? "groq").toLowerCase().trim();
  const provider: LLMProvider =
    rawProvider === "gemini" ? "gemini" : "groq";

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  let activeKey: string | undefined;
  let model: string;

  if (provider === "groq") {
    activeKey = groqKey && groqKey.trim().length > 10 ? groqKey.trim() : undefined;
    // Default to the verified 120B model; configurable via LLM_MODEL
    model = (process.env.LLM_MODEL ?? "openai/gpt-oss-120b").trim();
  } else {
    activeKey = geminiKey && geminiKey.trim().length > 10 ? geminiKey.trim() : undefined;
    model = (process.env.LLM_MODEL ?? "gemini-2.5-flash").trim();
  }

  return {
    provider,
    model,
    apiKey: activeKey,                  // ← Only used internally; never serialized to JSON responses
    isConfigured: activeKey !== undefined,
    groqEndpoint: "https://api.groq.com/openai/v1/chat/completions",
    geminiEndpoint: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  };
}
