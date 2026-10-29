export type OperatorCategory =
  | 'creation'
  | 'transformation'
  | 'filtering'
  | 'combination'
  | 'error-handling'
  | 'utility'
  | 'multicasting'
  | 'time-based'
  | 'legacy';

export type OperatorStatus =
  | 'recommended'
  | 'specialized'
  | 'deprecated'
  | 'removed';

export type OperatorDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface OperatorDefinition {
  id: string;
  name: string;
  category: OperatorCategory;
  description: string;
  difficulty: OperatorDifficulty;
  status: OperatorStatus;
  useCases: string[];
  relatedOperators: string[];
  officialDocsUrl: string;
  componentPath: string;
}

export interface OperatorFilter {
  query?: string;
  category?: OperatorCategory | 'all';
  difficulty?: OperatorDifficulty | 'all';
  status?: OperatorStatus | 'all';
}
