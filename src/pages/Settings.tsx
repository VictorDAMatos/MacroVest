import { useEffect, useState, type ReactNode } from 'react';
import { Bell, Check, Contrast, Eye, Moon, RotateCcw, ShieldCheck, Sun, Type, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../contexts/AppContext';
import { Button, Card, CardHeader, PageHeading } from '../components/ui';
import { Modal } from '../components/ui/Modal';
import { environment, isBackendMode } from '../config/environment';

export function Settings() {
  const { theme, setTheme, resetDemo, data } = useApp();
  const [resetOpen, setResetOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try { return { execution: true, macro: true, suggestions: false, ...JSON.parse(localStorage.getItem('macrovest.notifications') ?? '{}') }; } catch { return { execution: true, macro: true, suggestions: false }; }
  });
  const [accessibility, setAccessibility] = useState(() => {
    try { return { highContrast: false, largeText: false, reduceMotion: false, ...JSON.parse(localStorage.getItem('macrovest.accessibility') ?? '{}') }; } catch { return { highContrast: false, largeText: false, reduceMotion: false }; }
  });
  const { highContrast, largeText, reduceMotion } = accessibility;

  useEffect(() => {
    localStorage.setItem('macrovest.notifications', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', accessibility.highContrast);
    document.documentElement.classList.toggle('large-text', accessibility.largeText);
    document.documentElement.classList.toggle('reduce-motion', accessibility.reduceMotion);
    localStorage.setItem('macrovest.accessibility', JSON.stringify(accessibility));
  }, [accessibility]);

  const toggleAccessibility = (key: 'highContrast' | 'largeText' | 'reduceMotion', value: boolean) => {
    setAccessibility((current) => ({ ...current, [key]: value }));
  };

  return <div className="page-stack"><PageHeading eyebrow="PREFERÊNCIAS" title="Configurações" description="Ajuste a experiência do MacroVest ao seu jeito de acompanhar informações." />
    <div className="settings-layout"><div className="settings-main-column">
      <Card><CardHeader title="Aparência" subtitle="Personalize a apresentação da aplicação" /><div className="theme-options"><button className={`theme-option ${theme === 'dark' ? 'selected' : ''}`} onClick={() => setTheme('dark')}><div className="theme-preview theme-preview-dark"><div /><span /><i /></div><div className="theme-option-copy"><strong><Moon size={15} /> Modo escuro</strong><small>Ideal para ambientes com pouca luz</small></div><span className="theme-radio">{theme === 'dark' && <Check size={12} />}</span></button><button className={`theme-option ${theme === 'light' ? 'selected' : ''}`} onClick={() => setTheme('light')}><div className="theme-preview theme-preview-light"><div /><span /><i /></div><div className="theme-option-copy"><strong><Sun size={15} /> Modo claro</strong><small>Visual leve para ambientes iluminados</small></div><span className="theme-radio">{theme === 'light' && <Check size={12} />}</span></button></div></Card>
      <Card><CardHeader title="Acessibilidade" subtitle="Ajustes para melhorar leitura e conforto visual" /><div className="settings-toggle-list"><ToggleRow icon={<Contrast size={17} />} title="Alto contraste" description="Reforça a separação entre textos, bordas e fundos." checked={highContrast} onChange={(value) => toggleAccessibility('highContrast', value)} /><ToggleRow icon={<Type size={17} />} title="Texto ampliado" description="Aumenta ligeiramente o tamanho dos textos da interface." checked={largeText} onChange={(value) => toggleAccessibility('largeText', value)} /><ToggleRow icon={<Eye size={17} />} title="Reduzir animações" description="Diminui transições e movimentos decorativos." checked={reduceMotion} onChange={(value) => toggleAccessibility('reduceMotion', value)} /></div></Card>
      <Card><CardHeader title="Notificações" subtitle="Escolha quais atualizações deseja visualizar" /><div className="settings-toggle-list"><ToggleRow icon={<Bell size={17} />} title="Execuções e comprovantes" description="Quando uma simulação for concluída ou interrompida." checked={notifications.execution} onChange={(value) => setNotifications((current) => ({ ...current, execution: value }))} /><ToggleRow icon={<Volume2 size={17} />} title="Atualizações macroeconômicas" description="Quando houver atualização dos indicadores fictícios." checked={notifications.macro} onChange={(value) => setNotifications((current) => ({ ...current, macro: value }))} /><ToggleRow icon={<ShieldCheck size={17} />} title="Novas recomendações" description="Quando uma estratégia demonstrativa estiver disponível." checked={notifications.suggestions} onChange={(value) => setNotifications((current) => ({ ...current, suggestions: value }))} /></div><div className="settings-save-row"><span>Preferências de notificação aplicadas nesta sessão.</span><Button size="sm" variant="secondary" onClick={() => toast.success('Preferências atualizadas')}>Salvar preferências</Button></div></Card>
    </div><div className="settings-side-column"><Card><CardHeader title="Conexão com o back-end" subtitle="Configuração da camada de integração" /><div className="settings-toggle-list"><div className="settings-toggle-row"><span className="settings-row-icon"><ShieldCheck size={17} /></span><div className="settings-row-copy"><strong>{isBackendMode ? 'Modo API ativo' : 'Modo demonstrativo'}</strong><small>{isBackendMode ? 'As propostas e execuções tentarão utilizar os serviços HTTP configurados.' : 'As propostas e execuções usam repositórios locais simulados.'}</small></div><span className="theme-radio">{isBackendMode ? 'API' : 'MOCK'}</span></div><div className="settings-row-copy"><strong>Endereço base</strong><small>{environment.apiBaseUrl || 'Não configurado. Defina VITE_API_BASE_URL no arquivo .env.'}</small></div><div className="settings-row-copy"><strong>Rotas preparadas</strong><small>POST /propostas · GET /propostas/:id · POST /propostas/:id/execucoes · GET /execucoes/:id</small></div></div></Card><Card className="settings-profile-card"><div className="settings-profile-avatar">{data.profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><h3>{data.profile.name}</h3><p>Perfil {data.profile.risk.toLowerCase()}</p><div className="settings-profile-meta"><span>Objetivos cadastrados</span><strong>{data.profile.goals.length}</strong></div><div className="settings-profile-meta"><span>Simulações armazenadas</span><strong>{data.executions.length}</strong></div></Card><Card className="reset-card"><div className="reset-icon"><RotateCcw size={18} /></div><h3>Restaurar demonstração</h3><p>Apague as alterações locais e retorne aos dados fictícios iniciais do MacroVest.</p><Button variant="danger" className="button-full" onClick={() => setResetOpen(true)}><RotateCcw size={15} /> Restaurar dados iniciais</Button></Card><div className="settings-privacy-note"><ShieldCheck size={17} /><p><strong>{isBackendMode ? 'Dados enviados ao serviço configurado.' : 'Seus dados ficam no dispositivo.'}</strong> {isBackendMode ? 'O perfil e as solicitações de execução são enviados ao endereço de API configurado. Indicadores e demais informações demonstrativas continuam locais.' : 'Este modo usa armazenamento local do navegador e não transmite informações para servidores.'}</p></div></div></div>
    <Modal open={resetOpen} onOpenChange={setResetOpen} title="Restaurar dados iniciais?" description="Esta ação não pode ser desfeita."><div className="confirm-modal-copy"><div className="confirm-warning-icon"><RotateCcw size={20} /></div><p>O perfil, as notificações e o histórico de execuções voltarão aos valores fictícios originais. A preferência de tema será mantida.</p></div><div className="form-actions"><Button variant="secondary" onClick={() => setResetOpen(false)}>Cancelar</Button><Button variant="danger" onClick={() => { resetDemo(); setResetOpen(false); toast.success('Dados fictícios restaurados'); }}>Confirmar restauração</Button></div></Modal>
  </div>;
}

function ToggleRow({ icon, title, description, checked, onChange }: { icon: ReactNode; title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="settings-toggle-row"><span className="settings-row-icon">{icon}</span><div className="settings-row-copy"><strong>{title}</strong><small>{description}</small></div><button type="button" role="switch" aria-checked={checked} className={`switch ${checked ? 'switch-on' : ''}`} onClick={() => onChange(!checked)}><span /></button></div>;
}
