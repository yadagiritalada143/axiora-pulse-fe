import type { WorkspaceMentorStateValue } from '../types';

export interface AgentStep {
  id: number;
  name: string;
  description: string;
  details: string[];
}

export const AGENT_STEPS: AgentStep[] = [
  {
    id: 1,
    name: 'Idea Validation Agent',
    description: 'Validates business idea, feasibility & potential gaps',
    details: [
      "Validates the founder's business idea and determines whether it is genuine.",
      'Evaluates whether the idea is realistic and feasible.',
      'Identifies potential gaps, assumptions, and areas that need refinement.',
    ],
  },
  {
    id: 2,
    name: 'Market Research Agent',
    description: 'Analyzes target audience, demand & competitor positioning',
    details: [
      'Identifies the target audience and customer segments.',
      'Analyzes market demand and industry trends.',
      'Evaluates competitors and their positioning.',
      'Identifies market opportunities and potential risks that the founder may have overlooked.',
    ],
  },
  {
    id: 3,
    name: 'Survey Intelligence Agent',
    description: 'Creates market surveys & analyzes customer sentiment',
    details: [
      'Creates customer market validation surveys.',
      'Collects and analyzes customer responses.',
      'Interprets overall market sentiment.',
      'Identifies recurring customer pain points.',
      "Measures customers' willingness to pay.",
      "Determines whether customer feedback validates the founder's original business assumptions.",
    ],
  },
  {
    id: 4,
    name: 'Go-To-Market Strategy Agent',
    description: 'Develops GTM approach & customer acquisition channels',
    details: [
      'Evaluates the best approach for introducing the product to the market.',
      'Recommends the most effective customer acquisition channels.',
      'Develops messaging and positioning frameworks.',
      'Creates product launch plans and identifies early traction opportunities.',
    ],
  },
  {
    id: 5,
    name: 'Financial Readiness Agent',
    description: 'Provides pricing strategies, cost structures & financial planning',
    details: [
      'Educates founders about suitable revenue models.',
      'Recommends pricing strategies and approaches.',
      'Provides insights into operational cost structures.',
      'Creates awareness of funding options and financial planning.',
      'Highlights potential financial risks without replacing professional financial advisory services.',
    ],
  },
];

export function getStepFromWorkspaceState(state?: WorkspaceMentorStateValue): number {
  switch (state) {
    case 'GATHERING_INFO':
      return 1;
    case 'READY_TO_VALIDATE':
    case 'VALIDATING':
      return 2;
    case 'VALIDATED':
      return 3;
    default:
      return 1;
  }
}
