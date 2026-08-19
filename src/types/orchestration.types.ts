export interface OrchestrationIdeaPayload {
  idea_title: string;
  idea_description: string;
  problem_statement: string;
  target_customer: string;
  industry: string;
  founder_validation_goal: string;
  geography: string;
}

export interface OrchestrationRunRequest {
  workspace_id: string;
  idea_id: string;
  workflow_type: string;
  idea: OrchestrationIdeaPayload;
}

export interface IdeaValidationAgentData {
  problem_clarity_score: number;
  falsifiable_problem_sentence: string;
  problem_statement_summary: string;
  pain_type_classification: string;
  who_and_frequency: string;
  current_workarounds: string[];
  assumption_list: string[];
  red_flags: string[];
  initial_recommendation: string;
  confidence: number;
}

export interface MarketResearchAgentData {
  audience_narrowness_score: number;
  primary_icp_summary: string;
  secondary_segments: string[];
  persona_summary: string;
  red_flags: string[];
  market_opportunity_score: number;
  market_opportunity_summary: string;
  target_customer_segments: string[];
  competitor_overview: string[];
  opportunity_signals: string[];
  risk_signals: string[];
  confidence: number;
}

export interface SurveyIntelligenceQuestion {
  question_text: string;
  question_type: string;
  target_hypothesis: string;
}

export interface SurveyIntelligenceAgentData {
  survey_title: string;
  survey_objective: string;
  target_audience_summary: string;
  questions: SurveyIntelligenceQuestion[];
  survey_quality_score: number;
  confidence: number;
  disclaimer: string;
}

export interface OrchestrationAgentResult<TData> {
  score: number;
  confidence: number;
  data: TData;
  model_used: string;
  tokens_input: number;
  tokens_output: number;
  executed_at: string;
}

export interface OrchestrationAgentResults {
  idea_validation_agent?: OrchestrationAgentResult<IdeaValidationAgentData>;
  market_research_agent?: OrchestrationAgentResult<MarketResearchAgentData>;
  survey_intelligence_agent?: OrchestrationAgentResult<SurveyIntelligenceAgentData>;
}

export interface ResearchQueryTrace {
  agent_name: string;
  query: string;
  status: string;
  timestamp: string;
}

export interface ResearchSourceTrace {
  agent_name: string;
  title?: string | null;
  url: string;
  snippet?: string | null;
  timestamp: string;
}

export interface ResearchTraceResponse {
  run_id: string;
  queries: ResearchQueryTrace[];
  sources: ResearchSourceTrace[];
  is_active: boolean;
}

export interface OrchestrationResult {
  idea_id: string;
  orchestration_run_id: string;
  validation_score: number;
  confidence_rating: number;
  verdict: string;
  strengths: string[];
  risks: string[];
  assumptions: string[];
  recommendations: string[];
  agent_results: OrchestrationAgentResults;
  mentor_summary: string;
  research_queries?: ResearchQueryTrace[];
  research_sources?: ResearchSourceTrace[];
  disclaimer: string;
  created_at: string;
}

export interface OrchestrationRunResponse {
  run_id: string;
  workspace_id: string;
  idea_id: string;
  workflow_type: string;
  status: string;
  result: OrchestrationResult | null;
  error: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface ResearchStreamQueryEvent {
  type?: 'query';
  event?: 'research_query';
  run_id?: string;
  agent?: string;
  agent_name?: string;
  query: string;
  status?: string;
  index?: number;
  total?: number;
  timestamp: string;
}

export interface ResearchStreamSourceEvent {
  type?: 'source';
  event?: 'research_source';
  run_id?: string;
  agent?: string;
  agent_name?: string;
  query?: string;
  title?: string | null;
  url: string;
  snippet?: string | null;
  timestamp: string;
}

export interface ResearchStreamSnapshotEvent {
  event: 'snapshot';
  run_id: string;
  data: ResearchTraceResponse;
}

export interface ResearchStreamCompleteEvent {
  event: 'run_completed' | 'complete';
  type?: 'complete';
  run_id?: string;
  status?: string;
  total_queries?: number;
  total_sources?: number;
  timestamp: string;
}

export interface ResearchStreamPingEvent {
  event: 'ping';
  timestamp: string;
}

export type ResearchStreamEvent =
  | ResearchStreamSnapshotEvent
  | ResearchStreamQueryEvent
  | ResearchStreamSourceEvent
  | ResearchStreamCompleteEvent
  | ResearchStreamPingEvent;
