import { useMemo, useState } from 'react';
import { Download, Eye, Filter, Search, X } from 'lucide-react';
import { Card, CardHeader, PageHeading, StatusPill, Button, EmptyState } from '../components/ui';
import { Modal } from '../components/ui/Modal';
import { getExecutionById, isBackendMode } from '../services';
import { toast } from 'sonner';
import { useApp } from '../contexts/AppContext';
import { currency, dateTime } from '../utils/format';
import type { ExecutionRecord } from '../types';

export function History() {
  const { data } = useApp();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [period, setPeriod] = useState('Todos');
  const [sort, setSort] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ExecutionRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const now = new Date();
    return [...data.executions].filter((item) => {
      const matchesSearch = `${item.id} ${item.strategy} ${item.risk}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'Todos' || item.status === status;
      const executionDate = new Date(item.date);
      const matchesPeriod = period === 'Todos' || (period === '30 dias' && executionDate >= new Date(now.getTime() - 30 * 86400000)) || (period === '90 dias' && executionDate >= new Date(now.getTime() - 90 * 86400000));
      return matchesSearch && matchesStatus && matchesPeriod;
    }).sort((a, b) => sort === 'date-desc' ? +new Date(b.date) - +new Date(a.date) : sort === 'date-asc' ? +new Date(a.date) - +new Date(b.date) : sort === 'amount-desc' ? b.amount - a.amount : a.amount - b.amount);
  }, [data.executions, search, status, period, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openDetails = async (record: ExecutionRecord) => {
    setSelected(record);
    if (!isBackendMode) return;
    setDetailLoading(true);
    try {
      const latest = await getExecutionById(record.id);
      if (latest) setSelected(latest);
    } catch (error) {
      toast.error('Não foi possível atualizar os detalhes no back-end.', { description: error instanceof Error ? error.message : 'Exibindo os dados locais disponíveis.' });
    } finally {
      setDetailLoading(false);
    }
  };

  const exportCsv = () => {
    const headers = ['ID', 'Data', 'Valor', 'Estrategia', 'Perfil', 'Status', 'Duração (ms)'];
    const lines = filtered.map((item) => [item.id, dateTime(item.date), item.amount, item.strategy, item.risk, item.status, item.durationMs].join(';'));
    const blob = new Blob([[headers.join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'macrovest-historico.csv'; anchor.click(); URL.revokeObjectURL(url);
  };

  return <div className="page-stack"><PageHeading eyebrow="RASTREABILIDADE" title="Histórico de execuções" description="Consulte as simulações realizadas e acesse seus comprovantes." action={<Button variant="secondary" onClick={exportCsv}><Download size={16} /> Exportar CSV</Button>} />
    <div className="history-summary-grid"><Card><span>Total de execuções</span><strong>{data.executions.length}</strong><small>Registros disponíveis nesta sessão</small></Card><Card><span>Concluídas</span><strong>{data.executions.filter((item) => item.status === 'Concluído').length}</strong><small>Sem ressalvas</small></Card><Card><span>Com ressalvas</span><strong>{data.executions.filter((item) => item.status === 'Concluído com ressalvas').length}</strong><small>Finalizadas com alertas</small></Card><Card><span>Falhas</span><strong>{data.executions.filter((item) => item.status === 'Falha').length}</strong><small>Interrompidas com segurança</small></Card></div>
    <Card><CardHeader title="Todas as execuções" subtitle={`${filtered.length} resultado(s) encontrados`} action={<span className="filter-label"><Filter size={14} /> Filtros ativos</span>} /><div className="history-filters"><div className="history-search"><Search size={16} /><input placeholder="Buscar por ID ou estratégia..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />{search && <button onClick={() => setSearch('')} aria-label="Limpar busca"><X size={14} /></button>}</div><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filtrar por status"><option>Todos</option><option>Concluído</option><option>Concluído com ressalvas</option><option>Falha</option></select><select value={period} onChange={(event) => { setPeriod(event.target.value); setPage(1); }} aria-label="Filtrar por período"><option>Todos</option><option>30 dias</option><option>90 dias</option></select><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Ordenar resultados"><option value="date-desc">Mais recentes</option><option value="date-asc">Mais antigos</option><option value="amount-desc">Maior valor</option><option value="amount-asc">Menor valor</option></select></div>
      {rows.length ? <><div className="table-wrap"><table className="data-table history-table"><thead><tr><th>Identificador</th><th>Data e horário</th><th>Valor</th><th>Estratégia</th><th>Status</th><th>Duração</th><th /></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{item.id}</strong><small>Perfil {item.risk}</small></td><td>{dateTime(item.date)}</td><td className="numeric-cell">{currency(item.amount)}</td><td>{item.strategy}</td><td><StatusPill status={item.status} /></td><td>{item.durationMs} ms</td><td><button className="icon-button table-action" onClick={() => void openDetails(item)} aria-label={`Ver detalhes de ${item.id}`}><Eye size={16} /></button></td></tr>)}</tbody></table></div><div className="table-pagination"><span>Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, filtered.length)} de {filtered.length}</span><div><button className="pagination-button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Anterior</button><span className="pagination-current">{page} / {totalPages}</span><button className="pagination-button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Próxima</button></div></div></> : <EmptyState title="Nenhuma execução encontrada" description="Tente alterar os filtros ou inicie uma nova simulação para criar um registro." />}
    </Card>
    <Modal open={!!selected} onOpenChange={(open) => !open && setSelected(null)} title="Detalhes da execução" description={selected?.id} size="lg">{selected && (detailLoading ? <div className="loading-note">Consultando os detalhes no back-end...</div> : <ExecutionDetails record={selected} />)}</Modal>
  </div>;
}

function ExecutionDetails({ record }: { record: ExecutionRecord }) {
  return <div className="execution-detail-modal"><div className="detail-status-head"><StatusPill status={record.status} /><span>{dateTime(record.date)}</span></div><div className="detail-hero-value"><small>Valor simulado</small><strong>{currency(record.amount)}</strong></div><div className="receipt-doc-grid detail-grid"><div><small>Estratégia</small><strong>{record.strategy}</strong></div><div><small>Perfil</small><strong>{record.risk}</strong></div><div><small>Duração</small><strong>{record.durationMs} ms</strong></div><div><small>Identificador</small><strong>{record.id}</strong></div><div><small>Selic</small><strong>{record.macroSnapshot.selic}</strong></div><div><small>IPCA</small><strong>{record.macroSnapshot.ipca}</strong></div></div><div className="detail-rationale"><strong>Justificativa</strong><p>{record.rationale}</p></div>{record.issues.length > 0 && <div className="receipt-issues"><strong>Observações</strong>{record.issues.map((issue) => <p key={issue}>{issue}</p>)}</div>}{record.allocation.length > 0 && <div className="receipt-allocation"><strong>Distribuição considerada</strong>{record.allocation.map((item) => <div key={item.label}><span><i style={{ background: item.color }} />{item.label}</span><span>{item.percentage}%</span><strong>{currency(record.amount * item.percentage / 100)}</strong></div>)}</div>}<div className="form-actions"><Button variant="secondary" onClick={() => window.print()}><Download size={15} /> Imprimir comprovante</Button></div></div>;
}
