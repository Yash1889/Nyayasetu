export type TriageRoute = "NORMAL" | "HIGH_RISK" | "EMERGENCY" | "UNCERTAIN";

export type LegalContext = 
  | "Consumer" 
  | "Property_Tenancy" 
  | "Cyber_Financial" 
  | "Personal_Safety" 
  | "Family" 
  | "Labour" 
  | "Civil_Other";

export type EvidenceStatus = 
  | "SUFFICIENT" 
  | "INSUFFICIENT" 
  | "OUTDATED_LAW" 
  | "JURISDICTION_MISMATCH";

export interface TransitionMapping {
  historical_act: string;
  historical_section: string;
  nature_of_change: string;
}

export interface LegalAttributes {
  is_cognizable: boolean | null;
  is_bailable: boolean | null;
  is_compoundable: boolean | null;
  triable_by: string | null;
}

export interface LegalProvision {
  provision_id: string;
  act_title: string;
  act_short: string;
  act_year: number;
  act_number: string;
  jurisdiction: string;
  chapter: string;
  section_number: string;
  section_heading: string;
  verbatim_text: string;
  plain_summary: string;
  transition_mapping: TransitionMapping;
  legal_attributes: LegalAttributes;
  source_url: string;
  content_hash: string;
}

export interface RetrievedPassage {
  provision: LegalProvision;
  bm25_score: number;
  dense_score: number;
  hybrid_score: number;
}

export interface EmergencyContact {
  number: string;
  name: string;
  description: string;
  scope: string;
  is_national: boolean;
  state?: string;
  authority: string;
  official_url: string;
  verification_date: string;
  direct_dial: string;
  badge: string;
}

export interface SourcedCitation {
  provision_id: string;
  act_title: string;
  act_short: string;
  section_number: string;
  section_heading: string;
  source_url: string;
  historical_reference?: string;
}

export interface GroundedLegalResponse {
  plain_summary: string;
  legal_analysis: string;
  statutory_citations: SourcedCitation[];
  actionable_next_steps: string[];
  uncertainty_notes: string;
  professional_referral: {
    type: "DLSA" | "POLICE_STATION" | "CONSUMER_COMMISSION" | "CYBER_PORTAL" | "RTI_OFFICER";
    authority_name: string;
    helpline_number: string;
    portal_url?: string;
    notes: string;
  };
}

export interface TriageQuery {
  query: string;
  incident_date?: string;
  state_jurisdiction?: string;
  is_anonymous?: boolean;
}

export interface TriageResult {
  route: TriageRoute;
  assessed_context: LegalContext;
  evidence_status: EvidenceStatus;
  grounded_response?: GroundedLegalResponse;
  emergency_guidance?: {
    alert_title: string;
    immediate_steps: string[];
    applicable_contacts: EmergencyContact[];
    quick_exit_url: string;
  };
  clarification_prompt?: {
    issue: string;
    missing_elements: string[];
    suggested_questions: string[];
  };
  latency_ms: number;
  provider_used: string;
}

export interface ProceduralStep {
  step_number: number;
  title: string;
  statutory_deadline: string;
  description: string;
  evidence_required: string[];
}

export interface ProceduralPathway {
  id: string;
  title: string;
  category: string;
  governing_statutes: string[];
  statutory_prerequisites: string[];
  procedural_steps: ProceduralStep[];
  statutory_relief: string;
  forum: string;
}
