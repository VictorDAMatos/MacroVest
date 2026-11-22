import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva('button', {
  variants: {
    variant: { primary: 'button-primary', secondary: 'button-secondary', ghost: 'button-ghost', danger: 'button-danger', outline: 'button-outline' },
    size: { sm: 'button-sm', md: 'button-md', lg: 'button-lg' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

export function Button({ children, variant = 'primary', size = 'md', className, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'; size?: 'sm' | 'md' | 'lg' }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props}>{children}</button>;
}

export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return <section className={cn('card', className)} {...props}>{children}</section>;
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="card-header"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="page-heading-action">{action}</div>}</div>;
}

export function StatusPill({ status }: { status: string }) {
  const variant = status === 'Concluído' || status === 'Disponível' ? 'success' : status === 'Concluído com ressalvas' || status === 'Instável' ? 'warning' : status === 'Falha' || status === 'Indisponível' ? 'danger' : 'info';
  return <span className={`status-pill status-${variant}`}><span className="status-dot" />{status}</span>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-state-icon">◌</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function FieldError({ children }: { children?: ReactNode }) {
  return children ? <span className="field-error">{children}</span> : null;
}
