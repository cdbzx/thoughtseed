'use client';

import { useFormStatus } from 'react-dom';

type Props = {
  idleText: string;
  pendingText?: string;
  className?: string;
  variant?: 'default' | 'danger';
};

export function SubmitButton({ idleText, pendingText, className, variant = 'default' }: Props) {
  const { pending } = useFormStatus();
  const text = pending ? pendingText || '提交中…' : idleText;
  const disabled = pending;

  return (
    <button
      className={className}
      type="submit"
      disabled={disabled}
      aria-disabled={disabled}
      data-variant={variant}
    >
      {text}
    </button>
  );
}
