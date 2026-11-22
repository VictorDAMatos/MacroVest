import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Clock3, Download, Info, Play, RotateCcw, ShieldCheck, SlidersHorizontal, Sparkles, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../contexts/AppContext';
import { Card, PageHeading, Button, StatusPill } from '../components/ui';
import { strategies } from '../data';
import { createExecution, createProposal, isBackendMode } from '../services';
import { environment } from '../config/environment';
import { currency, dateTime } from '../utils/format';
import type { ExecutionScenario, ExecutionRecord } from '../types';

const processLabels = isBackendMode
  ? ['Validando solicitação', 'Enviando solicitação ao back-end', 'Aguardando processamento do servidor', 'Recebendo resultado da execução']
  : ['Consultando indicadores macroeconômicos', 'Analisando perfil financeiro', 'Processando política de investimento', 'Calculando distribuição do aporte', 'Finalizando simulação'];

export function Executions() {
  const { data, addExecution, addNotification, setProposalId } = useApp();
  const navigate = useNavigate();
  const strategy = strategies.find((item) => item.risk === data.profile.risk) ?? strategies[1];
  const [amount, setAmount] = useState(String(data.profile.monthlyInvestment));
  const [step, setStep] = useState<'configure' | 'preview' | 'processing' | 'receipt'>('configure');
  const [scenario, setScenario] = useState<ExecutionScenario['failAt']>('none');
  const [activeProcess, setActiveProcess] = useState(0);
  const [result, setResult] = useState<ExecutionRecord | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const numericAmount = Number(amount);
  const validAmount = Number.isFinite(numericAmount) && numericAmount > 0 && numericAmount <= data.profile.availableIncome;
  const allocations = useMemo(() => strategy.allocations.map((item) => ({ ...item, amount: numericAmount * item.percentage / 100 })), [strategy, numericAmount]);

  const startSimulation = async () => {
    if (!validAmount) {
      toast.error('Informe um valor válido', { description: 'O aporte deve ser maior que zero e não pode superar sua renda disponível.' });
      return;
    }

    setRequestError(null);
    setStep('processing');
    setActiveProcess(0);

    try {
      let proposalId = data.proposalMode === environment.apiMode ? data.proposalId : null;
      if (!proposalId) {
        const proposal = await createProposal(data.profile);
        proposalId = proposal.id;
        setProposalId(proposal.id, environment.apiMode);
      }

      const record = await createExecution({
        proposalId,
        amount: numericAmount,
        strategy,
        risk: data.profile.risk,
        scenario: { failAt: scenario },
      }, (label) => {
        const index = processLabels.indexOf(label);
        if (index >= 0) setActiveProcess(index);
      });

      addExecution(record);
      addNotification({
        id: `n-${Date.now()}`,
        title: record.status === 'Falha' ? 'Simulação interrompida' : 'Simulação concluída',
        description: `${record.id}: ${record.status.toLowerCase()}.`,
        date: new Date().toISOString(),
        type: record.status === 'Falha' ? 'error' : record.status === 'Concluído' ? 'success' : 'warning',
        read: false,
      });
      setResult(record);
      setActiveProcess(processLabels.length);
      setStep('receipt');

      if (record.status === 'Falha') {
        toast.error('A simulação encontrou uma falha', { description: 'Consulte os detalhes para entender o que aconteceu.' });
      } else {
        toast.success(record.status === 'Concluído' ? 'Simulação concluída!' : 'Simulação concluída com ressalvas.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível enviar a solicitação. Tente novamente.';
      setRequestError(message);
      setStep('preview');
      toast.error('Não foi possível concluir a solicitação', { description: message });
    }
  };

  const reset = () => { setStep('configure'); setResult(null); setRequestError(null); setScenario('none'); setAmount(String(data.profile.monthlyInvestment)); };
  const printReceipt = () => window.print();

  return <div className="page-stack"><PageHeading eyebrow="MOTOR DE EXECUÇÃO" title="Simulação de aportes" description="Teste como o motor organiza e processa um aporte, etapa por etapa." action={<div className="execution-mode-chip"><i /> {isBackendMode ? 'Modo API ativo' : 'Ambiente simulado'}</div>} />
    <div className="demo-banner"><div className="demo-banner-icon"><ShieldCheck size={17} /></div><div><strong>Nenhum dinheiro será movimentado</strong><span>{isBackendMode ? 'A solicitação será enviada ao back-end configurado. Nenhuma ordem financeira real deve ser enviada por esta demonstração.' : 'Esta experiência reproduz um fluxo de processamento com dados fictícios. Não há conexão com bancos ou corretoras.'}</span></div></div>

    {step === 'configure' && <div className="execution-layout"><Card className="execution-form-card"><div className="execution-step-head"><div className="execution-step-number">01</div><div><span className="eyebrow">CONFIGURAÇÃO</span><h2>Defina seu aporte</h2><p>Informe quanto deseja simular nesta execução.</p></div></div><label className="form-field amount-field">Valor do aporte<div className="currency-input"><span>R$</span><input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} min="1" step="100" placeholder="0,00" /></div><small>Disponível para aporte: {currency(data.profile.availableIncome)}</small></label>{!validAmount && amount !== '' && <span className="field-error">O valor deve ser positivo e não pode superar o disponível.</span>}<div className="amount-shortcuts"><span>Sugestões:</span>{[1000, 1500, data.profile.monthlyInvestment].filter((value, index, array) => value <= data.profile.availableIncome && array.indexOf(value) === index).map((value) => <button key={value} onClick={() => setAmount(String(value))}>{currency(value)}</button>)}</div><div className="execution-profile-box"><div className="avatar">{data.profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div><span>Perfil financeiro utilizado</span><strong>{data.profile.risk}</strong><small>{data.profile.goals.join(' · ')}</small></div><button className="text-button" onClick={() => navigate('/perfil')}>Editar perfil</button></div><Button className="button-full" onClick={() => validAmount && setStep('preview')} disabled={!validAmount}>Revisar simulação <ArrowRight size={16} /></Button></Card>
      <div className="execution-aside"><Card className="execution-strategy-card"><div className="strategy-card-top"><span className="eyebrow">ESTRATÉGIA APLICADA</span><span className="recommended-label"><Sparkles size={13} /> Recomendada</span></div><h3>{strategy.name}</h3><p>{strategy.description}</p><div className="execution-strategy-meta"><div><span>Risco</span><strong>{strategy.risk}</strong></div><div><span>Volatilidade</span><strong>{strategy.expectedVolatility}</strong></div></div><div className="execution-mini-allocation">{strategy.allocations.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.percentage}%</strong><i><b style={{ width: `${item.percentage}%`, background: item.color }} /></i></div>)}</div></Card><Card className="execution-security-note"><div className="security-note-icon"><ShieldCheck size={19} /></div><div><strong>Execução transparente</strong><p>Você verá cada etapa do processamento e receberá um comprovante detalhado ao final.</p></div></Card></div></div>}

    {step === 'preview' && <Card className="preview-card"><div className="execution-step-head"><div className="execution-step-number">02</div><div><span className="eyebrow">CONFERÊNCIA</span><h2>Revise a distribuição</h2><p>Confira como o valor seria alocado pela estratégia {strategy.name}.</p></div></div><div className="preview-summary"><div><span>Valor total do aporte</span><strong>{currency(numericAmount)}</strong></div><div><span>Estratégia</span><strong>{strategy.name}</strong></div><div><span>Perfil utilizado</span><strong>{data.profile.risk}</strong></div></div><div className="preview-allocation-list">{allocations.map((item) => <div className="preview-allocation-row" key={item.label}><span className="allocation-color" style={{ background: item.color }} /><div className="preview-allocation-info"><strong>{item.label}</strong><small>{item.percentage}% da simulação</small><div className="preview-progress"><i style={{ width: `${item.percentage}%`, background: item.color }} /></div></div><strong className="preview-allocation-value">{currency(item.amount)}</strong></div>)}</div><div>{!isBackendMode ? <div className="scenario-selector"><div><strong><SlidersHorizontal size={16} /> Cenário de teste</strong><p>Opcional: selecione uma condição para demonstrar a resiliência do sistema.</p></div><select value={scenario} onChange={(event) => setScenario(event.target.value as ExecutionScenario['failAt'])}><option value="none">Execução normal</option><option value="selic">Falha na consulta Selic</option><option value="ipca">Timeout na consulta IPCA</option><option value="source">Fonte externa instável</option><option value="processing">Erro no processamento</option></select></div> : <div className="calculation-hint"><Info size={16} /> Os cenários artificiais de falha ficam desativados no modo conectado. O resultado será fornecido pelo back-end.</div>}</div><div className="calculation-hint"><Info size={16} /> {isBackendMode ? 'A solicitação será processada pelo serviço configurado. Este front-end não movimenta recursos financeiros.' : 'Esta é uma prévia. A simulação não envia ordens nem movimenta recursos.'}</div>{requestError && <div className="receipt-issues issue-error"><strong><AlertCircle size={16} /> Falha na comunicação</strong><p>{requestError}</p></div>}<div className="form-actions"><Button variant="secondary" onClick={() => setStep('configure')}><ArrowLeft size={16} /> Ajustar valor</Button><Button onClick={startSimulation}><Play size={15} /> Confirmar simulação</Button></div></Card>}

    {step === 'processing' && <Card className="processing-card"><div className="processing-orb"><div className="processing-orb-inner"><ActivityIcon /></div></div><span className="eyebrow">MOTOR MACROVEST</span><h2>Processando sua simulação</h2><p>{isBackendMode ? 'Aguardando o retorno do serviço de execução configurado.' : 'Estamos percorrendo as etapas de análise e distribuição do aporte.'}</p><div className="processing-progress"><i style={{ width: `${((activeProcess + 0.35) / processLabels.length) * 100}%` }} /></div><div className="processing-steps">{processLabels.map((label, index) => <div key={label} className={`processing-step ${index < activeProcess ? 'complete' : index === activeProcess ? 'active' : ''}`}><span>{index < activeProcess ? <CheckCircle2 size={17} /> : index === activeProcess ? <span className="mini-spinner" /> : <span className="process-empty" />}</span><span>{label}</span><small>{index < activeProcess ? 'Concluído' : index === activeProcess ? 'Em andamento' : 'Aguardando'}</small></div>)}</div><p className="processing-footnote"><i className="pulse-dot" /> {isBackendMode ? 'O tempo de processamento depende da resposta do servidor.' : 'O tempo de processamento é simulado para fins de demonstração.'}</p></Card>}

    {step === 'receipt' && result && <Card className="receipt-card"><div className={`receipt-result-icon ${result.status === 'Falha' ? 'receipt-failed' : result.status === 'Concluído com ressalvas' ? 'receipt-warning' : ''}`}>{result.status === 'Falha' ? <XCircle size={27} /> : result.status === 'Concluído com ressalvas' ? <AlertCircle size={27} /> : <CheckCircle2 size={27} />}</div><span className="eyebrow">RESULTADO DA SIMULAÇÃO</span><h2>{result.status === 'Falha' ? 'Não foi possível concluir' : result.status === 'Concluído com ressalvas' ? 'Concluída com ressalvas' : 'Simulação concluída!'}</h2><p>{result.status === 'Falha' ? 'O motor identificou uma condição que impediu a finalização. Nenhum aporte foi processado.' : 'A alocação foi calculada e o comprovante da simulação está disponível abaixo.'}</p><div className="receipt-status-row"><StatusPill status={result.status} /><span><Clock3 size={14} /> {result.durationMs} ms</span></div>{result.issues.length > 0 && <div className={`receipt-issues ${result.status === 'Falha' ? 'issue-error' : ''}`}><strong><AlertCircle size={16} /> {result.status === 'Falha' ? 'O que aconteceu' : 'Pontos de atenção'}</strong>{result.issues.map((issue) => <p key={issue}>{issue}</p>)}</div>}<div className="receipt-document"><div className="receipt-doc-head"><div className="brand-mark brand-mark-small"><span>M</span><i /></div><div><strong>MacroVest</strong><small>COMPROVANTE DE SIMULAÇÃO</small></div><span className="receipt-doc-code">{result.id}</span></div><div className="receipt-doc-main"><span>VALOR SIMULADO</span><strong>{currency(result.amount)}</strong><div className="receipt-doc-grid"><div><small>Data e horário</small><strong>{dateTime(result.date)}</strong></div><div><small>Estratégia</small><strong>{result.strategy}</strong></div><div><small>Perfil</small><strong>{result.risk}</strong></div><div><small>Tempo de processamento</small><strong>{result.durationMs} ms</strong></div><div><small>Selic consultada</small><strong>{result.macroSnapshot.selic}</strong></div><div><small>IPCA consultado</small><strong>{result.macroSnapshot.ipca}</strong></div></div></div>{result.status !== 'Falha' && <div className="receipt-allocation"><strong>Distribuição calculada</strong>{result.allocation.map((item) => <div key={item.label}><span><i style={{ background: item.color }} />{item.label}</span><span>{item.percentage}%</span><strong>{currency(result.amount * item.percentage / 100)}</strong></div>)}</div>}<div className="receipt-doc-foot">Documento demonstrativo. Não representa ordem, aplicação ou movimentação financeira real.</div></div><div className="receipt-actions"><Button variant="secondary" onClick={printReceipt}><Download size={16} /> Imprimir / PDF</Button><Button onClick={reset}><RotateCcw size={16} /> Nova simulação</Button></div></Card>}
  </div>;
}

function ActivityIcon() { return <span className="activity-icon-bars"><i /><i /><i /><i /></span>; }
