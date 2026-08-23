export interface SurveyQuestionItem {
  id: number;
  question: string;
  questionType: 'text' | 'radio' | 'checkbox' | 'dropdown';
  options: string[];
}

export interface SurveyResponse {
  id: number;
  user_id: number;
  workspace_id: number;
  public_token: string;
  survey_link: string | null;
  questions: SurveyQuestionItem[];
  analysis_result?: SurveyAnalysisResult | null;
  created_at: string;
  updated_at: string;
}

export interface SurveyListResponse {
  total: number;
  surveys: SurveyResponse[];
}

export interface PublicAnswerItem {
  questionId: number;
  answer: string | string[];
}

export interface SubmitPublicSurveyRequest {
  respondentEmail?: string;
  answers: PublicAnswerItem[];
}

export interface SubmitPublicSurveyResponse {
  status: string;
  message: string;
  responseId: number;
}

export interface PublicSurveyDetailResponse {
  surveyId: string;
  workspaceName: string;
  questions: SurveyQuestionItem[];
}

export interface SingleSurveyResponseItem {
  id: number;
  survey_id: number;
  respondent_email: string | null;
  answers: { questionId: number; answer: unknown }[];
  submitted_at: string;
}

export interface SurveyResponsesListResponse {
  survey_id: number;
  total_responses: number;
  responses: SingleSurveyResponseItem[];
}

export interface WorkspaceSurveyQuestionItem {
  question_text: string;
  question_type: string;
  target_hypothesis?: string | null;
  options?: string[] | null;
}

export interface UpdateWorkspaceSurveyQuestionsRequest {
  survey_title?: string;
  survey_objective?: string;
  questions: WorkspaceSurveyQuestionItem[];
}

export interface UpdateWorkspaceSurveyQuestionsResponse {
  status: string;
  message: string;
  workspace_id: number;
  survey_title?: string | null;
  survey_objective?: string | null;
  questions: WorkspaceSurveyQuestionItem[];
}

export interface SurveyInsightItem {
  insight_id?: string;
  capability_id?: string;
  type?: string;
  statement?: string;
  status?: string;
  affected_segment?: string;
  frequency_or_magnitude?: string | number | null;
  supporting_evidence?: (string | SurveyInsightItem)[] | string;
  opposing_evidence?: (string | SurveyInsightItem)[] | string;
  sample_basis?: number | null;
  confidence_score?: number | null;
  confidence_band?: string;
  limitations?: (string | SurveyInsightItem)[] | string;
  business_implication?: string;
  recommended_action?: string;

  // Feature-specific aliases returned by BE or sub-generators
  problem_statement?: string;
  segment_name?: string;
  persona_name?: string;
  solution_feature?: string;
  readiness_level?: string;
  hypothesis?: string;
  pain_point?: string;
  severity?: string | number;
  frequency?: string | number;
  sentiment_label?: string;
  score?: number;
  summary?: string;
  details?: string;
  description?: string;
  need?: string;
  expectation?: string;
  indicator?: string;
  strength?: string;
  demand_level?: string;
  feature?: string;
  demand_score?: number;
  term?: string;
  context?: string;
  messaging_implication?: string;
  objection?: string;
  barrier?: string;
  mitigation?: string;
  action?: string;
  rationale?: string;
  priority?: string;
  expected_effect?: string;
  drivers?: (string | SurveyInsightItem)[] | string;
  barriers?: (string | SurveyInsightItem)[] | string;
  evidence_for?: (string | SurveyInsightItem)[] | string;
  evidence_against?: (string | SurveyInsightItem)[] | string;
  [key: string]: unknown;
}

export interface SurveyAnalysisDataQuality {
  fraud_risk_score?: number | null;
  response_quality_score?: number | null;
  sample_quality_score?: number | null;
  response_reliability_score?: number | null;
  excluded_or_quarantined_count?: number;
  exclusion_reasons?: (string | SurveyInsightItem)[];
  bias_indicators?: (string | SurveyInsightItem)[];
  quality_notes?: (string | SurveyInsightItem)[];
}

export interface SurveyAnalysisTargetPopulation {
  definition?: string;
  sample_size_raw?: number;
  sample_size_trusted?: number;
  segments?: (string | SurveyInsightItem)[];
  representativeness_status?: string;
  limitations?: (string | SurveyInsightItem)[];
}

export interface SurveyAnalysisCustomerIntelligence {
  sentiment?: (SurveyInsightItem | string)[];
  pain_points?: (SurveyInsightItem | string)[];
  behaviours?: (SurveyInsightItem | string)[];
  needs?: (SurveyInsightItem | string)[];
  demand?: (SurveyInsightItem | string)[];
  feature_demand?: (SurveyInsightItem | string)[];
  customer_language?: (SurveyInsightItem | string)[];
  objections?: (SurveyInsightItem | string)[];
}

export interface SurveyAnalysisValidation {
  segments?: (SurveyInsightItem | string)[];
  personas?: (SurveyInsightItem | string)[];
  problems?: (SurveyInsightItem | string)[];
  solutions?: (SurveyInsightItem | string)[];
  adoption_readiness?: (SurveyInsightItem | string)[];
  hypotheses?: (SurveyInsightItem | string)[];
  evidence_strength_score?: number | null;
  validation_confidence_score?: number | null;
  contradictions?: (SurveyInsightItem | string)[];
  problem_solution_fit_indicators?: (SurveyInsightItem | string)[];
}

export type SurveyAnalysisRecommendation = SurveyInsightItem;

export interface SurveyAnalysisGtmHandoff {
  priority_segments?: (string | SurveyInsightItem)[];
  validated_problems?: (string | SurveyInsightItem)[];
  value_proposition_implications?: (string | SurveyInsightItem)[];
  messaging_language?: (string | SurveyInsightItem)[];
  channel_implications?: (string | SurveyInsightItem)[];
  adoption_barriers?: (string | SurveyInsightItem)[];
  feature_priorities?: (string | SurveyInsightItem)[];
  risks?: (string | SurveyInsightItem)[];
  confidence_statement?: string | SurveyInsightItem;
}

export interface SurveyAnalysisResult {
  analysis_id?: string;
  survey_id?: string | number;
  survey_version?: string;
  analysis_timestamp?: string;
  purpose?: string;
  executive_summary?: string;
  target_population?: SurveyAnalysisTargetPopulation;
  data_quality?: SurveyAnalysisDataQuality;
  survey_performance?: Record<string, unknown>;
  customer_intelligence?: SurveyAnalysisCustomerIntelligence;
  validation?: SurveyAnalysisValidation;
  recommendations?: (SurveyInsightItem | string)[];
  unanswered_questions?: (string | SurveyInsightItem)[];
  next_research_actions?: (string | SurveyInsightItem)[];
  gtm_handoff?: SurveyAnalysisGtmHandoff;
  provenance?: Record<string, unknown>;
  error?: string;
  [key: string]: unknown;
}

export interface SurveyAnalysisResponse {
  survey_id: number;
  status: string;
  analysis_result: SurveyAnalysisResult;
}
