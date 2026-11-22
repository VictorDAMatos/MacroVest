import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Bell, ChartNoAxesCombined, Command, FileBarChart, Gauge, Menu, Moon, Search, Settings, ShieldCheck, Sun, UserRound, Wallet, X, Zap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { dateTime } from '../../utils/format';
import { Modal } from '../ui/Modal';

const navItems = [
  { label: 'Dashboard', path: '/', icon: Gauge },
  { label: 'Meu perfil financeiro', path: '/perfil', icon: UserRound },
  { label: 'Análise macroeconômica', path: '/macroeconomia', icon: Activity },
  { label: 'Estratégias de investimento', path: '/estrategias', icon: ChartNoAxesCombined },
  { label: 'Execuções', path: '/execucoes', icon: Zap },
  { label: 'Histórico', path: '/historico', icon: Wallet },
  { label: 'Relatórios', path: '/relatorios', icon: FileBarChart },
  { label: 'Configurações', path: '/configuracoes', icon: Settings },
];

const pageNames: Record<string, string> = {
  '/': 'Dashboard', '/perfil': 'Meu perfil financeiro', '/macroeconomia': 'Análise macroeconômica', '/estrategias': 'Estratégias de investimento', '/execucoes': 'Execuções', '/historico': 'Histórico de execuções', '/relatorios': 'Relatórios', '/configuracoes': 'Configurações',
};

export function AppLayout() {
  const { data, theme, setTheme, unreadCount, markNotificationsRead } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const searchResults = useMemo(() => [...navItems, { label: 'Nova simulação de aporte', path: '/execucoes', icon: Zap }].filter((item) => item.label.toLowerCase().includes(query.toLowerCase())), [query]);
  const notificationPreferences = (() => { try { return { execution: true, macro: true, suggestions: false, ...JSON.parse(localStorage.getItem('macrovest.notifications') ?? '{}') }; } catch { return { execution: true, macro: true, suggestions: false }; } })();
  const visibleNotifications = data.notifications.filter((item) => {
    const title = `${item.title} ${item.description}`.toLowerCase();
    if ((title.includes('execu') || title.includes('simula')) && !notificationPreferences.execution) return false;
    if ((title.includes('macro') || title.includes('indicador') || title.includes('fonte')) && !notificationPreferences.macro) return false;
    if (title.includes('recomenda') && !notificationPreferences.suggestions) return false;
    return true;
  });

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return <div className="app-shell">
    {sidebarOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><span>M</span><i /></div><div><strong>MacroVest</strong><small>INTELLIGENCE ENGINE</small></div><button className="mobile-close icon-button" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu"><X size={18} /></button></div>
      <div className="workspace-label">ESPAÇO DE TRABALHO</div>
      <nav className="side-nav" aria-label="Navegação principal">
        {navItems.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{path === '/execucoes' && <span className="nav-live-dot" />}</NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="system-mini"><div className="system-mini-icon"><ShieldCheck size={17} /></div><div><strong>Sistema operacional</strong><span><i className="pulse-dot" /> 3 fontes monitoradas</span></div></div>
        <button className="sidebar-user" onClick={() => navigate('/perfil')}><div className="avatar">{data.profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div className="sidebar-user-copy"><strong>{data.profile.name}</strong><span>Investidor {data.profile.risk.toLowerCase()}</span></div></button>
      </div>
    </aside>

    <div className="main-column">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button><div className="breadcrumb"><span>MacroVest</span><span className="breadcrumb-slash">/</span><strong>{pageNames[location.pathname] ?? 'Visão geral'}</strong></div></div>
        <div className="topbar-actions">
          <button className="search-trigger" onClick={() => setSearchOpen(true)}><Search size={16} /><span>Buscar páginas e ações...</span><kbd>⌘ K</kbd></button>
          <div className="notification-wrap"><button className="icon-button notification-button" aria-label="Notificações" onClick={() => { setNotificationsOpen((value) => !value); markNotificationsRead(); }}><Bell size={19} />{unreadCount > 0 && <i className="notification-dot" />}</button>
            {notificationsOpen && <div className="notification-popover"><div className="popover-title"><div><strong>Notificações</strong><span>{visibleNotifications.length} atualizações</span></div><button className="text-button" onClick={() => setNotificationsOpen(false)}>Fechar</button></div>{visibleNotifications.slice(0, 5).map((item) => <div className="notification-item" key={item.id}><span className={`notification-symbol notification-${item.type}`}><Bell size={14} /></span><div><strong>{item.title}</strong><p>{item.description}</p><small>{dateTime(item.date)}</small></div></div>)}</div>}
          </div>
          <button className="icon-button theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="topbar-avatar" onClick={() => navigate('/perfil')} aria-label="Abrir perfil">{data.profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</button>
        </div>
      </header>
      <main className="page-content"><Outlet /></main>
      <footer className="app-footer"><span>MacroVest <b>•</b> Ambiente de demonstração</span><span>Dados inteiramente fictícios <i className="pulse-dot" /></span></footer>
    </div>

    <Modal open={searchOpen} onOpenChange={setSearchOpen} title="Busca rápida" description="Encontre uma seção do MacroVest sem interromper seu fluxo.">
      <div className="search-modal-input"><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Digite o nome de uma página..." onKeyDown={(event) => { if (event.key === 'Enter' && searchResults[0]) { navigate(searchResults[0].path); setSearchOpen(false); setQuery(''); } }} /><kbd>ESC</kbd></div>
      <div className="search-results">{searchResults.length ? searchResults.map(({ label, path, icon: Icon }) => <button key={path} onClick={() => { navigate(path); setSearchOpen(false); setQuery(''); }}><Icon size={17} /><span>{label}</span><span className="search-enter">Enter ↵</span></button>) : <p className="muted-copy">Nenhuma página encontrada.</p>}</div>
      <div className="search-hint"><Command size={13} /> Atalho de teclado: Ctrl + K</div>
    </Modal>
    <div className="mobile-bottom-spacer" />
  </div>;
}
