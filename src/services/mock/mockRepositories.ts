import { INITIAL_EXECUTIONS, INITIAL_PROFILE, macroIndicators, strategies } from '../../data';
import type { AppData, ExecutionRecord, ExecutionScenario, FinancialProfile } from '../../types';
import { ApiError } from '../api/apiClient';
import type {
  CreateExecutionApiRequest,
  ExecutionApiResponse,
  ExecutionRepository,
  ProposalApiResponse,
  ProposalRepository,
} from '../api/contracts';
import { getFinancialProfile, processContribution } from './mockApi';

function readStoredAppData(): Partial<AppData> | undefined {
  try {
    const stored = localStorage.getItem('macrovest.app.v1');
    return stored ? JSON.parse(stored) as Partial<AppData> : undefined;
  } catch {
    return undefined;
  }
}

export class MockProposalRepository implements ProposalRepository {
  private readonly proposals = new Map<string, FinancialProfile>([['PROP-MV-001', INITIAL_PROFILE]]);

  async create(profile: FinancialProfile): Promise<ProposalApiResponse> {
    const result = { id: `PROP-MV-${String(Date.now()).slice(-6)}`, profile };
    this.proposals.set(result.id, profile);
    return result;
  }

  async getById(id: string): Promise<ProposalApiResponse> {
    const profile = this.proposals.get(id);
    if (profile) return { id, profile };
    const stored = readStoredAppData();
    if (stored?.proposalId === id && stored.profile) return { id, profile: stored.profile };
    if (id === 'PROP-MV-001') return { id, profile: await getFinancialProfile() };
    throw new ApiError('Proposta não encontrada no conjunto de dados demonstrativos.', 404, 'PROPOSAL_NOT_FOUND');
  }
}

export class MockExecutionRepository implements ExecutionRepository {
  private readonly executions = new Map<string, ExecutionRecord>(INITIAL_EXECUTIONS.map((record) => [record.id, record]));

  async create(
    _proposalId: string,
    request: CreateExecutionApiRequest,
    onStage?: (stage: string) => void,
    scenario: ExecutionScenario = { failAt: 'none' },
  ): Promise<ExecutionApiResponse> {
    const response = await processContribution(scenario, onStage ?? (() => undefined));
    const selectedStrategy = strategies.find((item) => item.id === request.strategyId);
    const record: ExecutionRecord = {
      id: `MV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
      date: new Date().toISOString(),
      amount: request.amount,
      strategy: request.strategyName,
      risk: request.riskProfile,
      status: response.status,
      durationMs: response.durationMs,
      allocation: response.status === 'Falha' ? [] : selectedStrategy?.allocations ?? request.allocation.map((item) => ({
        ...item,
        color: '#19b887',
        description: 'Distribuição demonstrativa da categoria',
      })),
      macroSnapshot: {
        selic: scenario.failAt === 'selic' ? 'Não consultado' : macroIndicators.find((item) => item.key === 'selic')?.formatted ?? 'Não disponível',
        ipca: scenario.failAt === 'ipca' ? 'Não consultado' : macroIndicators.find((item) => item.key === 'ipca')?.formatted ?? 'Não disponível',
        ibovespa: scenario.failAt === 'source' ? 'Último valor disponível' : macroIndicators.find((item) => item.key === 'ibovespa')?.formatted ?? 'Não disponível',
      },
      rationale: `Alocação simulada com base no perfil ${request.riskProfile.toLowerCase()} e na estratégia ${request.strategyName}. Nenhuma ordem real foi enviada.`,
      issues: response.issues,
    };
    this.executions.set(record.id, record);
    return record;
  }

  async getById(id: string): Promise<ExecutionApiResponse | undefined> {
    const cached = this.executions.get(id);
    if (cached) return cached;
    const stored = readStoredAppData();
    return stored?.executions?.find((record) => record.id === id);
  }
}
