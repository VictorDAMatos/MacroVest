import { useQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChartNoAxesCombined, Clock3, Coins, Plus, ShieldCheck, TrendingUp, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, PageHeading, StatusPill, Button } from '../components/ui';
import { AllocationDonut, DepositBarChart, MiniLineChart, PortfolioAreaChart } from '../components/charts/Charts';
import { useApp } from '../contexts/AppContext';
import { macroIndicators, portfolioHistory, strategies } from '../data';
import { getDashboardData } from '../services';
import { currency, dateTime } from '../utils/format';

export function Dashboard() {
  const navigate = useNavigate();
  const { data } = useApp();
  const dashboardQuery = useQuery({ queryKey: ['dashboard-summary'], queryFn: getDashboardData, staleTime: 60_000 });
  const recommended = strategies.find((item) => item.risk === data.profile.risk) ?? strategies[1];
  const executions = data.executions;
  const successful = executions.filter((item) => item.status !== 'Falha');
  const totalDeposits = successful.reduce((sum, item) => sum + item.amount, 0);
  const portfolioTotal = 49350 + Math.max(0, totalDeposits - 10000) * 0.36;
  const todayLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()).toUpperCase();

  return <div className="page-stack">
    <PageHeading eyebrow={todayLabel} title={`Bom dia, ${data.profile.name.split(' ')[0]}.`} description="Aqui está o panorama da sua jornada financeira." action={<Button onClick={() => navigate('/execucoes')}><Plus size={17} /> Nova simulação</Button>} />

    <div className="demo-banner"><div className="demo-banner-icon"><ShieldCheck size={17} /></div><div><strong>Ambiente demonstrativo</strong><span>Indicadores, patrimônio e execuções são dados simulados. Nenhuma movimentação financeira real é realizada.</span></div><button className="banner-link" onClick={() => navigate('/configuracoes')}>Saiba mais <ArrowRight size={14} /></button></div>

    <div className="stats-grid">
      <Card className="stat-card stat-primary"><div className="stat-top"><span>Patrimônio investido</span><span className="stat-icon"><WalletCards size={18} /></span></div><strong className="stat-value">{currency(portfolioTotal)}</strong><div className="stat-foot"><span className="trend-positive"><ArrowUpRight size={14} /> 5,8%</span><span>vs. mês anterior</span></div><div className="stat-spark"><MiniLineChart data={portfolioHistory.map(({ month, value }) => ({ label: month, value }))} /></div></Card>
      <Card className="stat-card"><div className="stat-top"><span>Total de aportes</span><span className="stat-icon icon-blue"><Coins size={18} /></span></div><strong className="stat-value">{currency(totalDeposits)}</strong><div className="stat-foot"><span className="stat-neutral">{successful.length} execuções</span><span>concluídas ou ressalvadas</span></div><div className="stat-foot-line"><span style={{ width: '72%' }} /></div></Card>
      <Card className="stat-card"><div className="stat-top"><span>Disponível para aportar</span><span className="stat-icon icon-violet"><TrendingUp size={18} /></span></div><strong className="stat-value">{currency(data.profile.availableIncome - data.profile.monthlyInvestment)}</strong><div className="stat-foot"><span className="stat-neutral">{currency(data.profile.monthlyInvestment)}</span><span>planejado para este mês</span></div><div className="stat-foot-line"><span style={{ width: '48%' }} /></div></Card>
      <Card className="stat-card"><div className="stat-top"><span>Rentabilidade simulada</span><span className="stat-icon icon-gold"><TrendingUp size={18} /></span></div><strong className="stat-value">+8,42%</strong><div className="stat-foot"><span className="trend-positive"><ArrowUpRight size={14} /> 1,2 p.p.</span><span>acumulado em 12 meses</span></div><div className="stat-foot-line"><span style={{ width: '63%' }} /></div></Card>
    </div>

    <div className="dashboard-grid dashboard-grid-main">
      <Card className="chart-card"><CardHeader title="Evolução do patrimônio" subtitle="Crescimento ao longo dos últimos 6 meses" action={<span className="chart-period-label">Últimos 6 meses</span>} /><div className="chart-legend"><span><i className="legend-dot legend-green" /> Patrimônio total</span><span className="chart-change">+12,7% no período</span></div><PortfolioAreaChart data={portfolioHistory} /></Card>
      <Card className="allocation-card"><CardHeader title="Alocação da carteira" subtitle="Distribuição sugerida pelo motor" /><div className="allocation-chart-area"><AllocationDonut data={recommended.allocations} height={205} /></div><div className="allocation-legend">{recommended.allocations.map((item) => <div key={item.label}><span><i style={{ background: item.color }} />{item.label}</span><strong>{item.percentage}%</strong></div>)}</div><button className="inline-link" onClick={() => navigate('/estrategias')}>Ver estratégia completa <ArrowRight size={14} /></button></Card>
    </div>

    <div className="dashboard-grid dashboard-grid-secondary">
      <Card className="chart-card deposits-card"><CardHeader title="Histórico de aportes" subtitle="Valores simulados por mês" action={<button className="inline-link" onClick={() => navigate('/historico')}>Ver histórico <ArrowRight size={14} /></button>} /><DepositBarChart data={portfolioHistory} /></Card>
      <Card className="macro-summary"><CardHeader title="Cenário macroeconômico" subtitle="Indicadores de referência" action={<button className="inline-link" onClick={() => navigate('/macroeconomia')}>Detalhes <ArrowRight size={14} /></button>} />
        <div className="macro-mini-list">{macroIndicators.map((item) => <div className="macro-mini-item" key={item.key}><div className="macro-mini-label"><span className={`macro-symbol macro-${item.key}`}>{item.key === 'selic' ? 'S' : item.key === 'ipca' ? 'I' : 'B'}</span><div><strong>{item.name}</strong><small>{item.unit}</small></div></div><div className="macro-mini-value"><strong>{item.formatted}</strong><span className={item.change >= 0 ? 'trend-positive' : 'trend-negative'}>{item.change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(item.change).toLocaleString('pt-BR')} p.p.</span></div></div>)}</div>
        <div className="source-health"><span><i className="pulse-dot" /> Fontes monitoradas</span><strong>2 de 3 estáveis</strong></div>
      </Card>
    </div>

    <div className="dashboard-grid dashboard-grid-bottom">
      <Card><CardHeader title="Últimas execuções" subtitle="Atividade recente do motor" action={<button className="inline-link" onClick={() => navigate('/historico')}>Ver todas <ArrowRight size={14} /></button>} />
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Execução</th><th>Data</th><th>Valor</th><th>Status</th></tr></thead><tbody>{executions.slice(0, 4).map((item) => <tr key={item.id} onClick={() => navigate('/historico')} className="clickable-row"><td><strong>{item.id}</strong><small>{item.strategy}</small></td><td>{dateTime(item.date)}</td><td className="numeric-cell">{currency(item.amount)}</td><td><StatusPill status={item.status} /></td></tr>)}</tbody></table></div>
      </Card>
      <Card className="strategy-callout"><div className="strategy-callout-top"><span className="eyebrow">ESTRATÉGIA RECOMENDADA</span><span className="recommend-badge"><i /> Personalizada</span></div><div className="strategy-mark"><ChartNoAxesCombined size={22} /></div><h3>{recommended.name}</h3><p>{recommended.headline}</p><div className="strategy-metrics"><div><span>Perfil</span><strong>{data.profile.risk}</strong></div><div><span>Volatilidade</span><strong>{recommended.expectedVolatility}</strong></div></div><button className="inline-link" onClick={() => navigate('/estrategias')}>Entender recomendação <ArrowRight size={14} /></button></Card>
    </div>

    {dashboardQuery.isLoading && <div className="loading-note"><Clock3 size={14} /> Atualizando dados de demonstração...</div>}
  </div>;
}
