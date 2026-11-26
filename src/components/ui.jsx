import { AlertCircle, CheckCircle2, ChevronDown, Inbox, LoaderCircle } from 'lucide-react'

export function PageHead({ title, description, action, eyebrow }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div className="min-w-0">
      {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.17em] text-[#47745e]">{eyebrow}</p>}
      <h1 className="lp-heading text-[clamp(1.85rem,3vw,2.5rem)]">{title}</h1>
      {description && <p className="mt-1.5 max-w-3xl text-[0.96rem] leading-relaxed text-[#52685c]">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
}

export function Button({ variant = 'primary', className = '', type = 'button', children, ...props }) {
  return <button type={type} className={['lp-button', 'lp-button-' + variant, className].join(' ')} {...props}>
    {children}
  </button>
}

export function Field({ label, hint, children, className = '' }) {
  return <label className={'block min-w-0 ' + className}>
    <span className="lp-label">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-sm text-[#586c61]">{hint}</span>}
  </label>
}

export function Input({ className = '', ...props }) {
  return <input className={'lp-input ' + className} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return <span className="relative block">
    <select className={'lp-input appearance-none pr-9 ' + className} {...props}>{children}</select>
    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#547361]" />
  </span>
}

export function Badge({ tone = 'neutral', children, className = '' }) {
  return <span className={['lp-badge', 'lp-badge-' + tone, className].join(' ')}>{children}</span>
}

export function Alert({ children, tone = 'error', className = '' }) {
  const success = tone === 'success' || tone === 'green'
  const Icon = success ? CheckCircle2 : AlertCircle
  return <div role={success ? 'status' : 'alert'} className={['lp-alert', 'lp-alert-' + tone, className].join(' ')}>
    <Icon aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
    <div className="min-w-0">{children}</div>
  </div>
}

export function EmptyState({ title, description, action, icon: Icon = Inbox }) {
  return <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-5 py-10 text-center">
    <span className="mb-1 grid h-11 w-11 place-items-center rounded-xl bg-[#e8f0e7] text-[#397658]"><Icon aria-hidden="true" size={22} /></span>
    <h3 className="font-bold text-[#203e30]">{title}</h3>
    {description && <p className="max-w-sm text-sm leading-relaxed text-[#5a6f62]">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
}

export function Spinner({ label = 'Cargando…', className = '' }) {
  return <span role="status" className={'inline-flex items-center gap-2 text-sm text-[#48715a] ' + className}>
    <LoaderCircle aria-hidden="true" size={18} className="animate-spin" />{label}
  </span>
}
