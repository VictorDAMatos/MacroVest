export type Theme = 'dark' | 'light';
export type RiskProfile = 'Conservador' | 'Moderado' | 'Arrojado';
export type ExecutionStatus = 'Concluído' | 'Concluído com ressalvas' | 'Falha';
export type ExecutionStage = 'Aguardando' | 'Processando' | 'Concluído' | 'Concluído com ressalvas' | 'Falha';

export interface FinancialProfile {
  name: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  availableIncome: number;
  monthlyInvestment: number;
  goals: string[];
  customGoal: string;
  risk: RiskProfile;
  updatedAt: string;
}

export interface MacroIndicator {
  key: 'selic' | 'ipca' | 'ibovespa';
  name: string;
  value: number;
  formatted: string;
  change: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  history: { label: string; value: number }[];
  sourceStatus: 'Disponível' | 'Instável' | 'Indisponível';
}

export interface AllocationItem {
  label: string;
  percentage: number;
  color: string;
  description: string;
}

export interface Strategy {
  id: string;
  name: string;
  risk: RiskProfile;
  headline: string;
  description: string;
  allocations: AllocationItem[];
  expectedVolatility: string;
  horizon: string;
  rationale: string[];
}

export interface ExecutionRecord {
  id: string;
  date: string;
  amount: number;
  strategy: string;
  risk: RiskProfile;
  status: ExecutionStatus;
  durationMs: number;
  allocation: AllocationItem[];
  macroSnapshot: { selic: string; ipca: string; ibovespa: string };
  rationale: string;
  issues: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'success' | 'warning' | 'info' | 'error';
  read: boolean;
}

export interface AppData {
  /** ID retornado por POST /propostas, persistido para vincular as execuções. */
  proposalId: string | null;
  proposalMode: 'mock' | 'http' | null;
  profile: FinancialProfile;
  executions: ExecutionRecord[];
  notifications: AppNotification[];
  onboardingDone: boolean;
}

export interface ExecutionScenario {
  failAt: 'none' | 'selic' | 'ipca' | 'source' | 'processing';
}
