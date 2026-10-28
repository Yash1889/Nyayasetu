import { LegalContext, TriageRoute } from "../types";

export interface RiskAnalysis {
  route: TriageRoute;
  context: LegalContext;
  confidence: number;
  matched_signals: string[];
  requires_immediate_safety: boolean;
}

// Regex patterns for deterministic emergency detection (English, Hindi, and Hinglish)
const EMERGENCY_PATTERNS: { pattern: RegExp; signal: string }[] = [
  // Active physical violence in progress
  { pattern: /\b(beating|hitting|strangling|attacking|killing|stabbing)\s+(me|us|her|him|my)\b/i, signal: "Active physical assault" },
  { pattern: /\b(locked\s+in|trapped|cannot\s+escape|held\s+hostage|confined)\b/i, signal: "Physical restraint / Confinement" },
  { pattern: /\b(he|she|they)\s+(has|have|holding)\s+(a\s+knife|a\s+gun|weapon|acid|petrol)\b/i, signal: "Weapon / Lethal threat" },
  { pattern: /\b(in\s+immediate\s+danger|save\s+me|help\s+me\s+now|call\s+police\s+now)\b/i, signal: "Urgent physical safety cry" },
  // Suicide / Self-harm
  { pattern: /\b(want\s+to\s+die|commit\s+suicide|end\s+my\s+life|kill\s+myself|cannot\s+live\s+anymore)\b/i, signal: "Self-harm / Suicide risk" },
  // Hindi / Hinglish emergency cries
  { pattern: /\b(mujhe\s+bachao|mar\s+raha\s+hai|jaan\s+ka\s+khatra|police\s+bulao|bachao\s+bachao)\b/i, signal: "Urgent cry in Hindi/Hinglish" },
  { pattern: /\b(maar\s+peet\s+kar\s+raha|ghar\s+se\s+bahar\s+nikal\s+diya\s+hai)\b/i, signal: "Immediate physical domestic threat" }
];

// High-risk patterns (serious threat or imminent financial/reputational damage without active assault)
const HIGH_RISK_PATTERNS: { pattern: RegExp; signal: string }[] = [
  { pattern: /\b(blackmail|extortion|demanding\s+money|leak\s+photos|threatened\s+to\s+kill)\b/i, signal: "Blackmail / Extortion / Threat" },
  { pattern: /\b(cyber\s+fraud|account\s+hacked|deducted|phishing|unauthorized\s+(transaction|debit|transfer|withdrawal)|otp\s+stolen|scam|scammed)\b/i, signal: "Active Cyber Financial Loss" },
  { pattern: /\b(stalking|following\s+me|harassing\s+daily|threatening\s+calls)\b/i, signal: "Persistent Stalking / Harassment" }
];

export function analyzeQueryRisk(query: string): RiskAnalysis {
  const normalized = query.trim().toLowerCase();
  const matchedSignals: string[] = [];

  // 1. Check deterministic emergency triggers
  for (const { pattern, signal } of EMERGENCY_PATTERNS) {
    if (pattern.test(normalized)) {
      matchedSignals.push(signal);
    }
  }

  if (matchedSignals.length > 0) {
    return {
      route: "EMERGENCY",
      context: detectLegalContext(normalized),
      confidence: 0.99,
      matched_signals: matchedSignals,
      requires_immediate_safety: true,
    };
  }

  // 2. Check high-risk triggers
  for (const { pattern, signal } of HIGH_RISK_PATTERNS) {
    if (pattern.test(normalized)) {
      matchedSignals.push(signal);
    }
  }

  if (matchedSignals.length > 0) {
    return {
      route: "HIGH_RISK",
      context: detectLegalContext(normalized),
      confidence: 0.88,
      matched_signals: matchedSignals,
      requires_immediate_safety: false,
    };
  }

  // 3. Check for ambiguity / missing facts (Uncertain route)
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length < 4 || /^(help|legal advice|what to do|is this legal|court case|law help please)$/i.test(normalized)) {
    return {
      route: "UNCERTAIN",
      context: detectLegalContext(normalized),
      confidence: 0.40,
      matched_signals: ["Query is overly brief or ambiguous"],
      requires_immediate_safety: false,
    };
  }

  // 4. Default to Normal route
  return {
    route: "NORMAL",
    context: detectLegalContext(normalized),
    confidence: 0.85,
    matched_signals: [],
    requires_immediate_safety: false,
  };
}

export function detectLegalContext(text: string): LegalContext {
  const lower = text.toLowerCase();

  // Personal Safety & Violence (Priority: violence and physical threats take precedence over civil family classification)
  if (/\b(assault|beating|violence|threat|abuse|stalking|harassment|hurt|police|fir|injury|domestic\s+violence|attack|attacking|knife|weapon|kill|killing|murder|stab|stabbing|harm|danger)\b/.test(lower)) {
    return "Personal_Safety";
  }

  // Consumer
  if (/\b(consumer|seller|refund|product|delivery|defective|warranty|flipkart|amazon|e-commerce|bought|goods|service\s+deficiency)\b/.test(lower)) {
    return "Consumer";
  }

  // Cyber & Financial
  if (/\b(cyber|bank|account|upi|otp|scam|fraud|phishing|unauthorized|hacked|telegram\s+task|invest|crypto)\b/.test(lower)) {
    return "Cyber_Financial";
  }

  // Property & Tenancy
  if (/\b(landlord|tenant|rent|security\s+deposit|eviction|flat|lease|property|possession|premises)\b/.test(lower)) {
    return "Property_Tenancy";
  }

  // Family (Non-violent matrimonial matters)
  if (/\b(marriage|divorce|custody|maintenance|alimony|dowry|husband|wife|matrimonial)\b/.test(lower)) {
    return "Family";
  }

  // Labour
  if (/\b(salary|wages|employer|employee|job|termination|pf|gratuity|workplace|overtime)\b/.test(lower)) {
    return "Labour";
  }

  // Default Civil / Other (including Cheque bounce, RTI, contracts)
  return "Civil_Other";
}
