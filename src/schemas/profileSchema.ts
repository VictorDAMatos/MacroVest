import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(3, 'Informe seu nome completo.'),
  monthlyIncome: z.number().positive('A renda deve ser maior que zero.'),
  monthlyExpenses: z.number().min(0, 'As despesas não podem ser negativas.'),
  availableIncome: z.number().min(0, 'O valor disponível não pode ser negativo.'),
  monthlyInvestment: z.number().min(0, 'O aporte não pode ser negativo.'),
  goals: z.array(z.string()).min(1, 'Selecione pelo menos um objetivo.'),
  customGoal: z.string(),
  risk: z.enum(['Conservador', 'Moderado', 'Arrojado']),
}).superRefine((value, ctx) => {
  if (value.monthlyExpenses > value.monthlyIncome) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyExpenses'], message: 'As despesas não podem superar a renda mensal.' });
  if (value.availableIncome > value.monthlyIncome - value.monthlyExpenses + 0.01) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['availableIncome'], message: 'O disponível não pode superar a renda após as despesas.' });
  if (value.monthlyInvestment > value.availableIncome) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthlyInvestment'], message: 'O aporte mensal não pode superar o valor disponível.' });
  if (value.goals.includes('Outro') && value.customGoal.trim().length < 3) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['customGoal'], message: 'Descreva seu objetivo personalizado.' });
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
