import { INITIAL_EXECUTIONS, INITIAL_PROFILE, macroIndicators, strategies } from '../../data';
import type { ExecutionScenario, FinancialProfile, ExecutionRecord, RiskProfile } from '../../types';

const pause = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function getDashboardData() {
  await pause(180);
  return { indicators: macroIndicators, strategies, executions: INITIAL_EXECUTIONS };
}

export async function getFinancialProfile(): Promise<FinancialProfile> {
  await pause(240);
  return INITIAL_PROFILE;
}

export async function saveFinancialProfile(profile: FinancialProfile): Promise<FinancialProfile> {
  await pause(400);
  return profile;
}

export async function createProposal(profile: FinancialProfile): Promise<{ id: string; profile: FinancialProfile }> {
  await pause(350);
  return { id: 'PROP-MV-001', profile };
}

export async function getExecution(id: string, records: ExecutionRecord[]): Promise<ExecutionRecord | undefined> {
  await pause(220);
  return records.find((item) => item.id === id);
}

export interface SimulatedExecutionResult {
  status: ExecutionRecord['status'];
  durationMs: number;
  issues: string[];
}

export async function processContribution(scenario: ExecutionScenario, onStage: (stage: string) => void): Promise<SimulatedExecutionResult> {
  const stages = [
    { label: 'Consultando indicadores macroeconômicos', fail: scenario.failAt === 'selic' || scenario.failAt === 'ipca' },
    { label: 'Analisando perfil financeiro', fail: false },
    { label: 'Processando política de investimento', fail: scenario.failAt === 'processing' },
    { label: 'Calculando distribuição do aporte', fail: false },
    { label: 'Finalizando simulação', fail: false },
  ];
  const started = performance.now();
  const issues: string[] = [];
  for (let index = 0; index < stages.length; index += 1) {
    onStage(stages[index].label);
    await pause(650 + index * 110);
    if (stages[index].fail) {
      if (scenario.failAt === 'source') issues.push('Uma fonte externa simulada ficou indisponível.');
      if (scenario.failAt === 'selic') issues.push('Falha na consulta da taxa Selic.');
      if (scenario.failAt === 'ipca') issues.push('Timeout na consulta do IPCA.');
      if (scenario.failAt === 'processing') issues.push('O motor encontrou uma inconsistência durante o processamento.');
      return { status: 'Falha', durationMs: Math.round(performance.now() - started), issues };
    }
    if (scenario.failAt === 'source' && index === 0) issues.push('Ibovespa indisponível; último valor simulado mantido para referência.');
  }
  return { status: issues.length > 0 ? 'Concluído com ressalvas' : 'Concluído', durationMs: Math.round(performance.now() - started), issues };
}

export function getRecommendedRisk(risk: RiskProfile): RiskProfile {
  return risk;
}
