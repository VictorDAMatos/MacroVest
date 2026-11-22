import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowRight, ChartNoAxesCombined, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import { Toaster } from 'sonner';
import { AppProvider, useApp } from './contexts/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Macroeconomics } from './pages/Macroeconomics';
import { Strategies } from './pages/Strategies';
import { Executions } from './pages/Executions';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } });

export function App() {
  return <QueryClientProvider client={queryClient}><AppProvider><BrowserRouter><Routes><Route element={<AppLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="perfil" element={<Profile />} />
    <Route path="macroeconomia" element={<Macroeconomics />} />
    <Route path="estrategias" element={<Strategies />} />
    <Route path="execucoes" element={<Executions />} />
    <Route path="historico" element={<History />} />
    <Route path="relatorios" element={<Reports />} />
    <Route path="configuracoes" element={<Settings />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes><Onboarding /><Toaster position="bottom-right" theme="dark" richColors closeButton /></BrowserRouter></AppProvider></QueryClientProvider>;
}

function Onboarding() {
  const { data, setOnboardingDone } = useApp();
  const [page, setPage] = useState(0);
  const slides = [
    { icon: <ChartNoAxesCombined size={24} />, title: 'Inteligência para enxergar o cenário', description: 'O MacroVest reúne dados financeiros e indicadores macroeconômicos simulados para contextualizar sua estratégia.' },
    { icon: <WalletCards size={24} />, title: 'Estratégias que fazem sentido para o perfil', description: 'Explore diferentes distribuições, compare níveis de risco e entenda os fatores por trás de cada recomendação.' },
    { icon: <ShieldCheck size={24} />, title: 'Cada etapa, às claras', description: 'Acompanhe o processamento de um aporte, veja como falhas são tratadas e consulte o comprovante da simulação.' },
  ];
  const current = slides[page];
  return <Modal open={!data.onboardingDone} onOpenChange={(open) => !open && setOnboardingDone()} title="Boas-vindas ao MacroVest" description="Uma visita rápida antes de explorar sua central de investimentos." size="lg">
    <div className="onboarding-content"><div className="onboarding-illustration"><div className="onboarding-glow" /><div className="onboarding-icon">{current.icon}</div><div className="onboarding-float onboarding-float-one"><Sparkles size={15} /></div><div className="onboarding-float onboarding-float-two"><ShieldCheck size={15} /></div></div><span className="eyebrow">PASSO {page + 1} DE 3</span><h2>{current.title}</h2><p>{current.description}</p><div className="onboarding-dots">{slides.map((slide, index) => <button key={slide.title} aria-label={`Ir para passo ${index + 1}`} className={index === page ? 'active' : ''} onClick={() => setPage(index)} />)}</div><div className="onboarding-actions"><button className="text-button" onClick={setOnboardingDone}>Pular introdução</button><Button onClick={() => page === 2 ? setOnboardingDone() : setPage((value) => value + 1)}>{page === 2 ? 'Começar a explorar' : 'Próximo'} <ArrowRight size={16} /></Button></div></div>
  </Modal>;
}
