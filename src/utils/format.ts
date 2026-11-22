import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
export const compactCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(value);
export const dateTime = (value: string) => format(new Date(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
export const dateOnly = (value: string) => format(new Date(value), 'dd MMM yyyy', { locale: ptBR });
