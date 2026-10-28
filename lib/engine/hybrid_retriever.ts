import { LegalProvision, RetrievedPassage } from "../types";
import seedData from "../../data/seed_provisions.json";

const provisions: LegalProvision[] = seedData as LegalProvision[];

// Legal stop words to ignore in BM25 calculation
const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "by", "for", "with", "about", "against", "between",
  "into", "through", "during", "before", "after", "above", "below", "to", "from", "up",
  "down", "of", "off", "over", "under", "again", "further", "then", "once", "here",
  "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
  "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
  "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "i",
  "me", "my", "myself", "we", "our", "you", "your", "he", "him", "his", "she", "her",
  "they", "them", "what", "is", "was", "are", "were", "be", "been", "being", "have", "has",
  "law", "legal", "act", "section", "court", "case", "help", "please", "sir", "madam", "give", "tell"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

// Pre-calculate BM25 corpus stats
const corpusDocs = provisions.map(p => {
  const fullText = `${p.act_short} Section ${p.section_number} ${p.section_heading} ${p.plain_summary} ${p.verbatim_text} ${p.transition_mapping?.historical_section || ""}`;
  const tokens = tokenize(fullText);
  return { id: p.provision_id, tokens, length: tokens.length };
});

const avgDocLength = corpusDocs.reduce((acc, d) => acc + d.length, 0) / (corpusDocs.length || 1);
const N = corpusDocs.length;

// Document frequencies
const docFreqs: Map<string, number> = new Map();
for (const doc of corpusDocs) {
  const uniqueTokens = new Set(doc.tokens);
  for (const token of uniqueTokens) {
    docFreqs.set(token, (docFreqs.get(token) || 0) + 1);
  }
}

function calculateBM25Score(queryTokens: string[], docTokens: string[], docLength: number): number {
  const k1 = 1.5;
  const b = 0.75;
  let score = 0;

  const termCounts: Map<string, number> = new Map();
  for (const t of docTokens) {
    termCounts.set(t, (termCounts.get(t) || 0) + 1);
  }

  for (const qToken of queryTokens) {
    const df = docFreqs.get(qToken) || 0;
    if (df === 0) continue;

    // Standard Robertson-Spärck Jones IDF
    const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
    const tf = termCounts.get(qToken) || 0;

    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));

    score += idf * (numerator / denominator);
  }

  return score;
}

// Lightweight dense semantic similarity via token/n-gram Jaccard and conceptual embedding proxy
function calculateDenseScore(query: string, p: LegalProvision): number {
  const queryLower = query.toLowerCase();
  const summaryLower = (p.section_heading + " " + p.plain_summary).toLowerCase();
  
  const queryWords = new Set(tokenize(queryLower));
  const summaryWords = new Set(tokenize(summaryLower));

  if (queryWords.size === 0) return 0;

  let intersection = 0;
  for (const word of queryWords) {
    if (summaryWords.has(word)) intersection++;
  }

  // Jaccard similarity
  const union = new Set([...queryWords, ...summaryWords]).size;
  const jaccard = union > 0 ? intersection / union : 0;

  // Conceptual bonus for legal domain intent keywords
  let domainBonus = 0;
  if (/deposit|landlord|rent|flat|tenant/i.test(queryLower) && /deposit|tenant|lessor|lease/i.test(summaryLower)) {
    domainBonus += 0.35;
  }
  if (/cheque|bounce|bank|return\s+memo|unpaid/i.test(queryLower) && /cheque|dishonour/i.test(summaryLower)) {
    domainBonus += 0.40;
  }
  if (/scam|cyber|fraud|otp|hacked|stolen/i.test(queryLower) && /cheating|identity|computer|phishing/i.test(summaryLower)) {
    domainBonus += 0.35;
  }
  if (/refund|seller|defective|product|amazon|flipkart/i.test(queryLower) && /consumer|deficiency|complaint/i.test(summaryLower)) {
    domainBonus += 0.35;
  }
  if (/domestic\s+violence|beating|abuse|husband|wife/i.test(queryLower) && /domestic\s+violence|protection|residence/i.test(summaryLower)) {
    domainBonus += 0.40;
  }

  return Math.min(1.0, (jaccard * 1.5) + domainBonus);
}

export function hybridRetrieve(query: string, topK: number = 3, alpha: number = 0.40): RetrievedPassage[] {
  const queryTokens = tokenize(query);

  const rawResults: { provision: LegalProvision; bm25Raw: number; denseRaw: number }[] = [];
  let maxBM25 = 0.001;

  for (let i = 0; i < provisions.length; i++) {
    const prov = provisions[i];
    const docMeta = corpusDocs[i];

    const bm25 = calculateBM25Score(queryTokens, docMeta.tokens, docMeta.length);
    const dense = calculateDenseScore(query, prov);

    if (bm25 > maxBM25) maxBM25 = bm25;

    rawResults.push({ provision: prov, bm25Raw: bm25, denseRaw: dense });
  }

  // Normalize and fuse scores using Shybrid(q, d) = alpha * S_bm25 + (1 - alpha) * S_dense
  const ranked = rawResults.map(item => {
    const normBM25 = maxBM25 > 0 ? Math.min(1.0, item.bm25Raw / Math.max(3.0, maxBM25)) : 0;
    const normDense = Math.min(1.0, item.denseRaw);
    const hybrid = (alpha * normBM25) + ((1 - alpha) * normDense);

    return {
      provision: item.provision,
      bm25_score: Number(normBM25.toFixed(4)),
      dense_score: Number(normDense.toFixed(4)),
      hybrid_score: Number(hybrid.toFixed(4))
    };
  });

  ranked.sort((a, b) => b.hybrid_score - a.hybrid_score);

  return ranked.slice(0, topK);
}

export const retrieveHybrid = hybridRetrieve;

export function getAllProvisions(): LegalProvision[] {
  return provisions;
}

export function getProvisionById(id: string): LegalProvision | undefined {
  const clean = id.toLowerCase().replace(/[^a-z0-9]/g, "");
  return provisions.find(p => p.provision_id.toLowerCase().replace(/[^a-z0-9]/g, "") === clean);
}
