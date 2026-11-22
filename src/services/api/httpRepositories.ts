import type { ExecutionRecord, FinancialProfile } from '../../types';
import { ApiClient, ApiError, apiClient } from './apiClient';
import type {
  ApiEnvelope,
  CreateExecutionApiRequest,
  ExecutionApiResponse,
  ExecutionRepository,
  ProposalApiResponse,
  ProposalRepository,
} from './contracts';
import { unwrapApiData } from './contracts';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseProposal(value: unknown, fallbackProfile?: FinancialProfile): ProposalApiResponse {
  const payload = unwrapApiData(value as ApiEnvelope<unknown>);
  if (!isObject(payload) || typeof payload.id !== 'string' || !payload.id.trim()) {
    throw new ApiError('Resposta inválida do back-end ao salvar a proposta. Era esperado um identificador "id".', 502, 'INVALID_PROPOSAL_RESPONSE', payload);
  }

  const profile = isObject(payload.profile) ? payload.profile as unknown as FinancialProfile : fallbackProfile;
  if (!profile) {
    throw new ApiError('A resposta do back-end não contém o perfil financeiro da proposta.', 502, 'INVALID_PROPOSAL_RESPONSE', payload);
  }

  return { id: payload.id, profile };
}

function parseExecution(value: unknown): ExecutionApiResponse {
  const payload = unwrapApiData(value as ApiEnvelope<unknown>);
  if (!isObject(payload)) {
    throw new ApiError('O back-end retornou uma resposta inválida para a execução.', 502, 'INVALID_EXECUTION_RESPONSE', payload);
  }

  const requiredTextFields: (keyof ExecutionRecord)[] = ['id', 'date', 'strategy', 'rationale'];
  const hasRequiredText = requiredTextFields.every((field) => typeof payload[field] === 'string');
  const validStatus = ['Concluído', 'Concluído com ressalvas', 'Falha'].includes(String(payload.status));
  const validRisk = ['Conservador', 'Moderado', 'Arrojado'].includes(String(payload.risk));
  const validAmount = typeof payload.amount === 'number' && Number.isFinite(payload.amount);
  const validAllocation = Array.isArray(payload.allocation);
  const validMacroSnapshot = isObject(payload.macroSnapshot);
  const validIssues = Array.isArray(payload.issues);

  if (!hasRequiredText || !validStatus || !validRisk || !validAmount || !validAllocation || !validMacroSnapshot || !validIssues || typeof payload.durationMs !== 'number') {
    throw new ApiError(
      'A execução foi recebida, mas o formato da resposta não corresponde ao contrato esperado pelo MacroVest.',
      502,
      'INVALID_EXECUTION_RESPONSE',
      payload,
    );
  }

  return payload as unknown as ExecutionRecord;
}

export class HttpProposalRepository implements ProposalRepository {
  constructor(private readonly client: ApiClient = apiClient) {}

  async create(profile: FinancialProfile): Promise<ProposalApiResponse> {
    const response = await this.client.post<ApiEnvelope<unknown>>('/propostas', profile);
    return parseProposal(response, profile);
  }

  async getById(id: string): Promise<ProposalApiResponse> {
    const response = await this.client.get<ApiEnvelope<unknown>>(`/propostas/${encodeURIComponent(id)}`);
    return parseProposal(response);
  }
}

export class HttpExecutionRepository implements ExecutionRepository {
  constructor(private readonly client: ApiClient = apiClient) {}

  async create(
    proposalId: string,
    request: CreateExecutionApiRequest,
    onStage?: (stage: string) => void,
  ): Promise<ExecutionApiResponse> {
    onStage?.('Enviando solicitação ao back-end');
    onStage?.('Aguardando processamento do servidor');
    const response = await this.client.post<ApiEnvelope<unknown>>(
      `/propostas/${encodeURIComponent(proposalId)}/execucoes`,
      request,
    );
    onStage?.('Resultado recebido do back-end');
    return parseExecution(response);
  }

  async getById(id: string): Promise<ExecutionApiResponse | undefined> {
    const response = await this.client.get<ApiEnvelope<unknown>>(`/execucoes/${encodeURIComponent(id)}`);
    return parseExecution(response);
  }
}
