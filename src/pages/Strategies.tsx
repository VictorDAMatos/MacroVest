import { useState } from 'react';
import { ArrowRight, Check, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AllocationDonut } from '../components/charts/Charts';
import { Button, Card, CardHeader, PageHeading } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { strategies } from '../data';
import { currency } from '../utils/format';
import type { RiskProfile } from '../types';

export function Strategies() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<RiskProfile>(data.profile.risk);
  const current = strategies.find((item) => item.risk === selected) ?? strategies[1];
  const amount = data.profile.monthlyInvestment;
  return <div className="page-stack"><PageHeading eyebrow="ROBO-ADVISING · MOTOR DE RECOMENDAÇÃO" title="Estratégias de investimento" description="Entenda como o MacroVest organiza uma carteira a partir do perfil e do cenário simulado." action={<Button onClick={() => navigate('/execucoes')}>Simular aporte <ArrowRight size={16} /></Button>} />
    <div className="demo-banner"><div className="demo-banner-icon"><ShieldCheck size={17} /></div><div><strong>Regras demonstrativas, não aconselhamento financeiro</strong><span>As estratégias são calculadas por regras fictícias no front-end e não devem orientar decisões reais.</span></div></div>
    <Card className="recommended-panel"><div className="recommended-panel-main"><div className="recommend-label"><Sparkles size={14} /> SUGESTÃO PARA SEU PERFIL</div><h2>{strategies.find((item) => item.risk === data.profile.risk)?.name ?? 'Equilíbrio Dinâmico'}</h2><p>{strategies.find((item) => item.risk === data.profile.risk)?.headline}</p><div className="recommended-tags"><span><Check size={13} /> Perfil {data.profile.risk}</span><span><Check size={13} /> Objetivos considerados</span><span><Check size={13} /> Cenário macro simulado</span></div></div><div className="recommend-score"><span>ADERÊNCIA AO PERFIL</span><strong>{data.profile.risk === 'Moderado' ? '94' : data.profile.risk === 'Conservador' ? '96' : '91'}<small>/100</small></strong><div className="score-track"><i style={{ width: `${data.profile.risk === 'Moderado' ? 94 : data.profile.risk === 'Conservador' ? 96 : 91}%` }} /></div><small>Índice ilustrativo de compatibilidade</small></div></Card>
    <div className="section-heading"><div><h2>Compare as estratégias</h2><p>Selecione um perfil para visualizar a distribuição sugerida.</p></div><div className="segmented-control">{strategies.map((item) => <button key={item.id} className={selected === item.risk ? 'selected' : ''} onClick={() => setSelected(item.risk)}>{item.risk}</button>)}</div></div>
    <div className="strategy-detail-grid"><Card className="strategy-allocation-card"><CardHeader title={current.name} subtitle={current.description} /><AllocationDonut data={current.allocations} height={260} /><div className="strategy-allocation-list">{current.allocations.map((item) => <div key={item.label}><span><i style={{ background: item.color }} />{item.label}<small>{item.description}</small></span><strong>{item.percentage}%<small>{currency(amount * item.percentage / 100)}</small></strong></div>)}</div></Card>
      <div className="strategy-explain-col"><Card><CardHeader title="Por que essa estratégia?" subtitle="Fatores que influenciam a recomendação" /><div className="rationale-list">{current.rationale.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></div>)}</div></Card><Card><CardHeader title="Características da estratégia" /><div className="strategy-facts"><div><span>Volatilidade esperada</span><strong>{current.expectedVolatility}</strong></div><div><span>Horizonte sugerido</span><strong>{current.horizon}</strong></div><div><span>Perfil de referência</span><strong>{current.risk}</strong></div></div><div className="info-note"><Info size={16} /> A distribuição é ilustrativa e não representa ativos específicos ou ordens de investimento.</div></Card></div>
    </div>
    <Card className="strategy-footer-cta"><div><strong>Pronto para testar essa alocação?</strong><p>Simule um aporte e acompanhe cada etapa do processamento.</p></div><Button onClick={() => navigate('/execucoes')}>Iniciar simulação <ArrowRight size={16} /></Button></Card>
  </div>;
}
