import type { AppData, MacroIndicator, Strategy, ExecutionRecord } from './types';

export const INITIAL_PROFILE = {
  name: 'Mariana Costa',
  monthlyIncome: 12500,
  monthlyExpenses: 7200,
  availableIncome: 5300,
  monthlyInvestment: 2500,
  goals: ['Construção de patrimônio', 'Reserva de emergência'],
  customGoal: '',
  risk: 'Moderado' as const,
  updatedAt: new Date().toISOString(),
};

export const macroIndicators: MacroIndicator[] = [
  {
    key: 'selic', name: 'Taxa Selic', value: 14.75, formatted: '14,75%', change: 0.25, unit: '% a.a.', trend: 'up', sourceStatus: 'Disponível',
    history: [{ label: 'Jun', value: 10.5 }, { label: 'Jul', value: 10.5 }, { label: 'Ago', value: 10.75 }, { label: 'Set', value: 11.25 }, { label: 'Out', value: 12.25 }, { label: 'Nov', value: 14.75 }],
  },
  {
    key: 'ipca', name: 'IPCA', value: 4.62, formatted: '4,62%', change: -0.12, unit: 'acum. 12 meses', trend: 'down', sourceStatus: 'Disponível',
    history: [{ label: 'Jun', value: 5.1 }, { label: 'Jul', value: 4.95 }, { label: 'Ago', value: 4.83 }, { label: 'Set', value: 4.78 }, { label: 'Out', value: 4.74 }, { label: 'Nov', value: 4.62 }],
  },
  {
    key: 'ibovespa', name: 'Ibovespa', value: 128197, formatted: '128.197 pts', change: 1.38, unit: 'pontos', trend: 'up', sourceStatus: 'Instável',
    history: [{ label: 'Jun', value: 119000 }, { label: 'Jul', value: 122500 }, { label: 'Ago', value: 121800 }, { label: 'Set', value: 124000 }, { label: 'Out', value: 126300 }, { label: 'Nov', value: 128197 }],
  },
];

const conservativeAllocations = [
  { label: 'Pós-fixado', percentage: 55, color: '#19b887', description: 'Liquidez e estabilidade atreladas ao CDI' },
  { label: 'Inflação', percentage: 25, color: '#35a7db', description: 'Proteção do poder de compra no longo prazo' },
  { label: 'Pré-fixado', percentage: 15, color: '#7b83eb', description: 'Taxas definidas no momento da aplicação' },
  { label: 'Renda variável', percentage: 5, color: '#d6a65d', description: 'Exposição controlada ao mercado de ações' },
];
const moderateAllocations = [
  { label: 'Pós-fixado', percentage: 35, color: '#19b887', description: 'Liquidez e estabilidade atreladas ao CDI' },
  { label: 'Inflação', percentage: 25, color: '#35a7db', description: 'Proteção do poder de compra no longo prazo' },
  { label: 'Pré-fixado', percentage: 15, color: '#7b83eb', description: 'Taxas definidas no momento da aplicação' },
  { label: 'Renda variável', percentage: 25, color: '#d6a65d', description: 'Potencial de valorização com maior oscilação' },
];
const aggressiveAllocations = [
  { label: 'Pós-fixado', percentage: 15, color: '#19b887', description: 'Reserva tática de liquidez' },
  { label: 'Inflação', percentage: 15, color: '#35a7db', description: 'Proteção de longo prazo' },
  { label: 'Pré-fixado', percentage: 10, color: '#7b83eb', description: 'Oportunidades de taxa' },
  { label: 'Renda variável', percentage: 60, color: '#d6a65d', description: 'Maior exposição a ativos de crescimento' },
];

export const strategies: Strategy[] = [
  {
    id: 'conservadora', name: 'Defensiva', risk: 'Conservador', headline: 'Preservar primeiro. Crescer com consistência.',
    description: 'Prioriza previsibilidade, liquidez e proteção do capital, com exposição reduzida à renda variável.', allocations: conservativeAllocations,
    expectedVolatility: 'Baixa', horizon: 'Curto a médio prazo',
    rationale: ['Maior parcela em ativos pós-fixados para aproveitar juros elevados.', 'Exposição limitada à renda variável para reduzir oscilações.', 'Parcela indexada à inflação para preservar poder de compra.'],
  },
  {
    id: 'moderada', name: 'Equilíbrio Dinâmico', risk: 'Moderado', headline: 'Equilíbrio entre proteção e crescimento.',
    description: 'Combina uma base defensiva com exposição diversificada a oportunidades de valorização no longo prazo.', allocations: moderateAllocations,
    expectedVolatility: 'Média', horizon: 'Médio a longo prazo',
    rationale: ['A base em pós-fixados oferece estabilidade enquanto os juros permanecem elevados.', 'Títulos indexados à inflação ajudam a proteger objetivos de longo prazo.', 'Uma parcela em renda variável amplia o potencial de crescimento sem concentrar o risco.'],
  },
  {
    id: 'arrojada', name: 'Crescimento', risk: 'Arrojado', headline: 'Buscar crescimento com horizonte amplo.',
    description: 'Aceita oscilações mais intensas em busca de maior potencial de retorno no longo prazo.', allocations: aggressiveAllocations,
    expectedVolatility: 'Alta', horizon: 'Longo prazo',
    rationale: ['Maior peso em renda variável para buscar valorização.', 'Diversificação entre classes reduz concentração em uma única fonte de risco.', 'A parcela de renda fixa funciona como reserva tática e amortecedor.'],
  },
];

const makeExecution = (id: string, date: string, amount: number, strategy: string, status: ExecutionRecord['status'], durationMs: number, risk: ExecutionRecord['risk']): ExecutionRecord => {
  const selected = strategies.find((item) => item.risk === risk) ?? strategies[1];
  return {
    id, date, amount, strategy, risk, status, durationMs, allocation: selected.allocations,
    macroSnapshot: { selic: '14,75%', ipca: '4,62%', ibovespa: '128.197 pts' },
    rationale: 'Alocação simulada com base no perfil cadastrado e no cenário macroeconômico fictício disponível no momento da execução.',
    issues: status === 'Concluído com ressalvas' ? ['Fonte do Ibovespa apresentou instabilidade; foi utilizado o último valor simulado disponível.'] : status === 'Falha' ? ['A simulação foi interrompida durante a consulta de dados. Nenhum aporte foi processado.'] : [],
  };
};

export const INITIAL_EXECUTIONS: ExecutionRecord[] = [
  makeExecution('MV-2026-0084', '2026-11-10T14:32:00.000Z', 2500, 'Equilíbrio Dinâmico', 'Concluído', 842, 'Moderado'),
  makeExecution('MV-2026-0079', '2026-11-03T10:18:00.000Z', 1800, 'Equilíbrio Dinâmico', 'Concluído', 916, 'Moderado'),
  makeExecution('MV-2026-0071', '2026-10-24T16:45:00.000Z', 2200, 'Defensiva', 'Concluído com ressalvas', 1428, 'Conservador'),
  makeExecution('MV-2026-0068', '2026-10-16T11:05:00.000Z', 1500, 'Equilíbrio Dinâmico', 'Concluído', 790, 'Moderado'),
  makeExecution('MV-2026-0059', '2026-10-02T09:41:00.000Z', 2000, 'Crescimento', 'Falha', 2204, 'Arrojado'),
];

export const INITIAL_APP_DATA: AppData = {
  proposalId: null,
  proposalMode: null,
  profile: INITIAL_PROFILE,
  executions: INITIAL_EXECUTIONS,
  notifications: [
    { id: 'n-1', title: 'Simulação concluída', description: 'Sua execução MV-2026-0084 foi concluída com sucesso.', date: '2026-11-10T14:32:00.000Z', type: 'success', read: false },
    { id: 'n-2', title: 'Cenário macro atualizado', description: 'Os indicadores fictícios foram atualizados para a demonstração.', date: '2026-11-10T08:00:00.000Z', type: 'info', read: false },
    { id: 'n-3', title: 'Fonte instável', description: 'A fonte de dados do Ibovespa está respondendo com instabilidade simulada.', date: '2026-11-09T17:20:00.000Z', type: 'warning', read: true },
  ],
  onboardingDone: false,
};

export const portfolioHistory = [
  { month: 'Jun', value: 38200, deposits: 1800 }, { month: 'Jul', value: 40500, deposits: 2200 },
  { month: 'Ago', value: 42600, deposits: 1500 }, { month: 'Set', value: 44100, deposits: 2000 },
  { month: 'Out', value: 46800, deposits: 3700 }, { month: 'Nov', value: 49350, deposits: 2500 },
];
