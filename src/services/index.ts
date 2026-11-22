import { isBackendMode } from '../config/environment';
import type { ExecutionRecord, ExecutionScenario, FinancialProfile, Strategy } from '../types';
import { ApiError } from './api/apiClient';
import type { CreateExecutionApiRequest } from './api/contracts';
import { HttpExecutionRepository, HttpProposalRepository } from './api/httpRepositories';
import { MockExecutionRepository, MockProposalRepository } from './mock/mockRepositories';
import { getDashboardData } from './mock/mockApi';

const proposalRepository = isBackendMode ? new HttpProposalRepository() : new MockProposalRepository();
const executionRepository = isBackendMode ? new HttpExecutionRepository() : new MockExecutionRepository();

export interface CreateExecutionCommand {
  proposalId: string;
  amount: number;
  strategy: Strategy;
  risk: FinancialProfile['risk'];
  scenario?: ExecutionScenario;
}

export { isBackendMode };
export { getDashboardData };

export async function createProposal(profile: FinancialProfile): Promise<{ id: string; profile: FinancialProfile }> {
  return proposalRepository.create(profile);
}

export async function getProposalById(id: string) {
  return proposalRepository.getById(id);
}

export async function createExecution(
  command: CreateExecutionCommand,
  onStage: (stage: string) => void,
): Promise<ExecutionRecord> {
  if (!command.proposalId.trim()) {
    throw new ApiError('Salve o perfil financeiro antes de iniciar uma execução.', 400, 'PROPOSAL_ID_REQUIRED');
  }

  const request: CreateExecutionApiRequest = {
    amount: command.amount,
    strategyId: command.strategy.id,
    strategyName: command.strategy.name,
    riskProfile: command.risk,
    allocation: command.strategy.allocations.map(({ label, percentage }) => ({ label, percentage })),
  };

  if (isBackendMode) {
    return executionRepository.create(command.proposalId, request, onStage);
  }

  return (executionRepository as MockExecutionRepository).create(
    command.proposalId,
    request,
    onStage,
    command.scenario,
  );
}

export async function getExecutionById(id: string): Promise<ExecutionRecord | undefined> {
  return executionRepository.getById(id);
}
