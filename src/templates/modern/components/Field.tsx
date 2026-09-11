import { useId, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '#/lib/utils';

type Base = {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string | null;
  hint?: ReactNode;
  required?: boolean;
  testId?: string;
  autoComplete?: string;
  placeholder?: string;
  /** Supply an explicit id when an error summary needs to link to this control. */
  id?: string;
};

const shell = 'flex flex-col gap-2';
const labelCls = 'u-label text-n-600';
const inputCls =
  'w-full min-h-[52px] bg-transparent border-0 border-b-hair border-n-300 text-ink text-body-m py-3 outline-none transition-colors duration-micro ease-state placeholder:text-n-500 focus:border-b-rule focus:border-accent';

export function Field({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  testId,
  type = 'text',
  autoComplete,
  placeholder,
  inputMode,
  id: idProp,
}: Base & { type?: string; inputMode?: 'text' | 'tel' | 'email' | 'numeric' }) {
  const auto = useId();
  const id = idProp ?? auto;
  const errId = id + '-err';
  const hintId = id + '-hint';
  return (
    <div className={shell}>
      <label htmlFor={id} className={labelCls}>
        {label}
        {required ? <span className='text-accent'> *</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(error ? errId : '', hint ? hintId : '').trim() || undefined}
        aria-required={required}
        data-testid={testId}
        className={cn(inputCls, error && 'border-b-rule border-accent')}
      />
      {hint ? (
        <p id={hintId} className='text-body-s text-n-600'>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errId} className='flex items-center gap-2 text-body-s text-accent'>
          <AlertCircle aria-hidden='true' size={14} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextArea({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  testId,
  rows = 5,
  maxLength,
  placeholder,
  id: idProp,
}: Base & { rows?: number; maxLength?: number }) {
  const auto = useId();
  const id = idProp ?? auto;
  const errId = id + '-err';
  const hintId = id + '-hint';
  const countId = id + '-count';
  return (
    <div className={shell}>
      <div className='flex items-baseline justify-between gap-4'>
        <label htmlFor={id} className={labelCls}>
          {label}
          {required ? <span className='text-accent'> *</span> : null}
        </label>
        {maxLength ? (
          <span id={countId} className='u-label tnum text-n-600'>
            {value.length} / {maxLength}
          </span>
        ) : null}
      </div>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(error ? errId : '', hint ? hintId : '', maxLength ? countId : '').trim() || undefined}
        aria-required={required}
        data-testid={testId}
        className={cn(inputCls, 'resize-y py-3', error && 'border-b-rule border-accent')}
      />
      {hint ? (
        <p id={hintId} className='text-body-s text-n-600'>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errId} className='flex items-center gap-2 text-body-s text-accent'>
          <AlertCircle aria-hidden='true' size={14} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Native select with a persistently visible label - used by the fee estimator. */
export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  testId,
  hint,
  error,
  required,
  id: idProp,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  testId?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  id?: string;
}) {
  const auto = useId();
  const id = idProp ?? auto;
  const errId = id + '-err';
  const hintId = id + '-hint';
  return (
    <div className={shell}>
      <label htmlFor={id} className={labelCls}>
        {label}
        {required ? <span className='text-accent'> *</span> : null}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(error ? errId : '', hint ? hintId : '').trim() || undefined}
        aria-required={required}
        data-testid={testId}
        className={cn(inputCls, 'cursor-pointer appearance-none pr-6', error && 'border-b-rule border-accent')}
        style={{
          backgroundImage:
            'linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%)',
          backgroundPosition: 'right 10px center, right 5px center',
          backgroundSize: '5px 5px, 5px 5px',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={hintId} className='text-body-s text-n-600'>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errId} className='flex items-center gap-2 text-body-s text-accent'>
          <AlertCircle aria-hidden='true' size={14} />
          {error}
        </p>
      ) : null}
    </div>
  );
}
