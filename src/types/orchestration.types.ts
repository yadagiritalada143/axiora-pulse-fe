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

export interface OrchestrationAgentResultData {
  idea_clarity_score: number;
  problem_summary: string;
  customer_hypothesis: string;
  key_assumptions: string[];
  red_flags: string[];
  initial_recommendation: string;
  confidence: number;
  disclaimer: string;
}

export interface OrchestrationAgentResult {
  score: number;
  confidence: number;
  data: OrchestrationAgentResultData;
  model_used: string;
  tokens_input: number;
  tokens_output: number;
  executed_at: string;
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
  agent_results: Record<string, OrchestrationAgentResult>;
  mentor_summary: string;
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
