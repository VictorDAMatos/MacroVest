import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, CircleUserRound, PiggyBank, RefreshCw, Shield, Target } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button, Card, FieldError, PageHeading } from '../components/ui';
import { profileSchema, type ProfileFormValues } from '../schemas/profileSchema';
import { createProposal, getProposalById, isBackendMode } from '../services';
import { environment } from '../config/environment';
import { currency } from '../utils/format';
import type { RiskProfile } from '../types';
import { toast } from 'sonner';

const goalOptions = ['Reserva de emergência', 'Construção de patrimônio', 'Aposentadoria', 'Compra de imóvel', 'Outro'];
const riskDescriptions: Record<RiskProfile, string> = {
  Conservador: 'Prioriza segurança e previsibilidade. Tolera poucas oscilações e valoriza preservar o capital.',
  Moderado: 'Busca equilíbrio entre estabilidade e crescimento. Aceita oscilações controladas para objetivos de médio e longo prazo.',
  Arrojado: 'Aceita oscilações mais intensas em busca de potencial de valorização. Geralmente possui horizonte mais longo.',
};

export function Profile() {
  const { data, updateProfile, setProposalId } = useApp();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: data.profile.name,
      monthlyIncome: data.profile.monthlyIncome,
      monthlyExpenses: data.profile.monthlyExpenses,
      availableIncome: data.profile.availableIncome,
      monthlyInvestment: data.profile.monthlyInvestment,
      goals: data.profile.goals,
      customGoal: data.profile.customGoal,
      risk: data.profile.risk,
    },
  });
  const values = watch();
  const steps = [{ label: 'Informações', icon: CircleUserRound }, { label: 'Objetivos', icon: Target }, { label: 'Perfil de risco', icon: Shield }, { label: 'Revisão', icon: CheckCircle2 }];

  useEffect(() => {
    reset({ name: data.profile.name, monthlyIncome: data.profile.monthlyIncome, monthlyExpenses: data.profile.monthlyExpenses, availableIncome: data.profile.availableIncome, monthlyInvestment: data.profile.monthlyInvestment, goals: data.profile.goals, customGoal: data.profile.customGoal, risk: data.profile.risk });
  }, [data.profile, reset]);

  const goNext = async () => {
    const fields: (keyof ProfileFormValues)[][] = [
      ['name', 'monthlyIncome', 'monthlyExpenses', 'availableIncome', 'monthlyInvestment'],
      ['goals', 'customGoal'], ['risk'], [],
    ];
    if (step < 3 && await trigger(fields[step])) setStep((current) => Math.min(3, current + 1));
  };

  const toggleGoal = (goal: string) => {
    const selected = values.goals ?? [];
    setValue('goals', selected.includes(goal) ? selected.filter((item) => item !== goal) : [...selected, goal], { shouldValidate: true });
  };


  const refreshFromServer = async () => {
    if (!data.proposalId) return;
    setRefreshing(true);
    try {
      const proposal = await getProposalById(data.proposalId);
      updateProfile(proposal.profile);
      reset({
        name: proposal.profile.name,
        monthlyIncome: proposal.profile.monthlyIncome,
        monthlyExpenses: proposal.profile.monthlyExpenses,
        availableIncome: proposal.profile.availableIncome,
        monthlyInvestment: proposal.profile.monthlyInvestment,
        goals: proposal.profile.goals,
        customGoal: proposal.profile.customGoal,
        risk: proposal.profile.risk,
      });
      toast.success('Perfil atualizado a partir do back-end.');
    } catch (error) {
      toast.error('Não foi possível recuperar o perfil.', { description: error instanceof Error ? error.message : 'Tente novamente.' });
    } finally {
      setRefreshing(false);
    }
  };

  const submit = async (formValues: ProfileFormValues) => {
    setSaving(true);
    try {
      const profile = { ...formValues, availableIncome: Number(formValues.availableIncome), monthlyIncome: Number(formValues.monthlyIncome), monthlyExpenses: Number(formValues.monthlyExpenses), monthlyInvestment: Number(formValues.monthlyInvestment), updatedAt: new Date().toISOString() };
      const proposal = await createProposal(profile);
      updateProfile(profile);
      setProposalId(proposal.id, environment.apiMode);
      toast.success('Perfil financeiro atualizado', { description: 'As próximas simulações considerarão os dados atualizados.' });
      setStep(0);
    } catch (error) {
      toast.error('Não foi possível salvar o perfil.', { description: error instanceof Error ? error.message : 'Tente novamente.' });
    } finally { setSaving(false); }
  };

  return <div className="page-stack"><PageHeading eyebrow="SUA BASE DE DECISÃO" title="Meu perfil financeiro" description="Mantenha suas informações atualizadas para contextualizar as simulações." action={<div className="profile-saved">{isBackendMode && data.proposalId && data.proposalMode === 'http' && <Button size="sm" variant="secondary" onClick={refreshFromServer} disabled={refreshing}><RefreshCw size={14} /> {refreshing ? 'Atualizando...' : 'Atualizar do servidor'}</Button>}<span><CheckCircle2 size={15} /> Última atualização salva</span></div>} />
    <div className="profile-layout"><Card className="profile-steps-card"><span className="eyebrow">CONFIGURAÇÃO DO PERFIL</span><h3>Vamos por partes.</h3><p>Preencha as etapas para montar uma visão organizada da sua situação financeira.</p><div className="stepper">{steps.map(({ label, icon: Icon }, index) => <button key={label} className={`stepper-item ${step === index ? 'current' : ''} ${step > index ? 'done' : ''}`} onClick={() => index < step && setStep(index)} disabled={index > step}><span className="stepper-icon">{step > index ? <Check size={16} /> : <Icon size={16} />}</span><span><strong>{label}</strong><small>{index === 0 ? 'Dados e renda' : index === 1 ? 'O que deseja alcançar' : index === 2 ? 'Tolerância a riscos' : 'Confirme seus dados'}</small></span></button>)}</div><div className="profile-step-foot"><PiggyBank size={17} /><span>{isBackendMode ? 'O perfil será enviado ao serviço configurado.' : 'Seus dados ficam salvos apenas neste navegador.'}</span></div></Card>
      <Card className="profile-form-card"><div className="form-card-heading"><div><span className="eyebrow">ETAPA {step + 1} DE 4</span><h2>{steps[step].label}</h2></div><span className="step-percent">{Math.round(((step + 1) / 4) * 100)}%</span></div><div className="progress-track"><i style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
        <form onSubmit={handleSubmit(submit)}>
          {step === 0 && <div className="form-section"><p className="form-intro">Comece com uma fotografia da sua vida financeira hoje.</p><label className="form-field full-field">Nome completo<input {...register('name')} placeholder="Ex.: Mariana Costa" /> <FieldError>{errors.name?.message}</FieldError></label><div className="form-grid-two"><label className="form-field">Renda mensal (R$)<input type="number" min="0" step="100" {...register('monthlyIncome', { valueAsNumber: true })} /><FieldError>{errors.monthlyIncome?.message}</FieldError></label><label className="form-field">Despesas mensais (R$)<input type="number" min="0" step="100" {...register('monthlyExpenses', { valueAsNumber: true })} /><FieldError>{errors.monthlyExpenses?.message}</FieldError></label><label className="form-field">Renda disponível (R$)<input type="number" min="0" step="100" {...register('availableIncome', { valueAsNumber: true })} /><FieldError>{errors.availableIncome?.message}</FieldError></label><label className="form-field">Aporte mensal desejado (R$)<input type="number" min="0" step="100" {...register('monthlyInvestment', { valueAsNumber: true })} /><FieldError>{errors.monthlyInvestment?.message}</FieldError></label></div><div className="calculation-hint"><InfoIcon /> O valor disponível representa a quantia que sobra após as despesas. Confira se os valores estão coerentes.</div></div>}
          {step === 1 && <div className="form-section"><p className="form-intro">Selecione os objetivos que fazem sentido para seu momento. Você pode escolher mais de um.</p><div className="goal-options">{goalOptions.map((goal) => <button type="button" key={goal} className={`goal-option ${values.goals?.includes(goal) ? 'selected' : ''}`} onClick={() => toggleGoal(goal)}><span className="goal-check">{values.goals?.includes(goal) && <Check size={14} />}</span><span>{goal}</span></button>)}</div><FieldError>{errors.goals?.message}</FieldError>{values.goals?.includes('Outro') && <label className="form-field full-field custom-goal-field">Descreva seu objetivo<input {...register('customGoal')} placeholder="Ex.: intercâmbio em 2028" /><FieldError>{errors.customGoal?.message}</FieldError></label>}</div>}
          {step === 2 && <div className="form-section"><p className="form-intro">Seu perfil ajuda a contextualizar a relação entre estabilidade e risco nas simulações.</p><div className="risk-options">{(['Conservador', 'Moderado', 'Arrojado'] as RiskProfile[]).map((risk, index) => <button type="button" key={risk} className={`risk-option ${values.risk === risk ? 'selected' : ''}`} onClick={() => setValue('risk', risk, { shouldValidate: true })}><span className={`risk-symbol risk-${index}`}><Shield size={18} /></span><span className="risk-option-copy"><strong>{risk}</strong><small>{riskDescriptions[risk]}</small></span><span className="radio-indicator" /></button>)}</div><FieldError>{errors.risk?.message}</FieldError><div className="calculation-hint"><InfoIcon /> O perfil é uma referência demonstrativa, não uma avaliação regulatória de suitability.</div></div>}
          {step === 3 && <div className="form-section"><p className="form-intro">Revise as informações antes de salvar seu perfil.</p><div className="review-panel"><div className="review-title"><div className="avatar avatar-large">{(values.name || 'MC').split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div><strong>{values.name}</strong><span>Perfil {values.risk}</span></div></div><div className="review-grid"><div><span>Renda mensal</span><strong>{currency(Number(values.monthlyIncome))}</strong></div><div><span>Despesas mensais</span><strong>{currency(Number(values.monthlyExpenses))}</strong></div><div><span>Disponível</span><strong>{currency(Number(values.availableIncome))}</strong></div><div><span>Aporte mensal</span><strong>{currency(Number(values.monthlyInvestment))}</strong></div></div><div className="review-goals"><span>Objetivos selecionados</span><div>{values.goals?.map((goal) => <i key={goal}>{goal === 'Outro' ? values.customGoal : goal}</i>)}</div></div></div><div className="calculation-hint"><CheckCircle2 size={16} /> Ao confirmar, essas informações serão usadas para personalizar as próximas simulações.</div></div>}
          <div className="form-actions">{step > 0 ? <Button type="button" variant="secondary" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} /> Voltar</Button> : <span className="form-footnote">Etapas salvas somente ao confirmar.</span>}{step < 3 ? <Button type="button" onClick={goNext}>Continuar <ArrowRight size={16} /></Button> : <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Confirmar perfil'} <Check size={16} /></Button>}</div>
        </form>
      </Card></div>
  </div>;
}

function InfoIcon() { return <span className="info-icon-small">i</span>; }
