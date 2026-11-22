import type { AllocationItem, ExecutionRecord, FinancialProfile, RiskProfile } from '../../types';

/** Resposta prevista para POST/GET /propostas. */
export interface ProposalApiResponse {
  id: string;
  profile: FinancialProfile;
}

/** Corpo enviado para POST /propostas/{id}/execucoes. */
export interface CreateExecutionApiRequest {
  amount: number;
  strategyId: string;
  strategyName: string;
  riskProfile: RiskProfile;
  allocation: Pick<AllocationItem, 'label' | 'percentage'>[];
}

/** Resposta prevista para POST/GET /execucoes/{id}. */
export type ExecutionApiResponse = ExecutionRecord;

/** Permite tanto respostas JSON diretas quanto o envelope { data: ... }. */
export type ApiEnvelope<T> = T | { data: T };

export function unwrapApiData<T>(response: ApiEnvelope<T>): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

export interface ProposalRepository {
  create(profile: FinancialProfile): Promise<ProposalApiResponse>;
  getById(id: string): Promise<ProposalApiResponse>;
}

export interface ExecutionRepository {
  create(
    proposalId: string,
    request: CreateExecutionApiRequest,
    onStage?: (stage: string) => void,
  ): Promise<ExecutionApiResponse>;
  getById(id: string): Promise<ExecutionApiResponse | undefined>;
}
