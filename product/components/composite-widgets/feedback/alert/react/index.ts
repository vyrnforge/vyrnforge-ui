import { createElement, forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Button } from '../button/index.js';
import type { FeedbackSeverity } from '../../internal/feedback.js';
export type { FeedbackSeverity } from '../../internal/feedback.js';

export type AlertVariant = 'subtle' | 'outlined';
export type AlertAnnouncement = 'none' | 'polite' | 'assertive';

export interface AlertProps extends Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'aria-live' | 'aria-atomic'> {
  severity?: FeedbackSeverity;
  variant?: AlertVariant;
  announcement?: AlertAnnouncement;
  heading?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  dismiss?: { label: string; onDismiss(): void };
}

/** Persistent feedback; visual severity, announcement urgency and visibility are independent. */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    severity = 'informational',
    variant = 'subtle',
    announcement = 'none',
    heading,
    icon,
    actions,
    dismiss,
    children,
    ...props
  },
  ref,
) {
  const role = announcement === 'assertive' ? 'alert' : announcement === 'polite' ? 'status' : undefined;
  const dismissProps = {
    'data-vf-alert-dismiss': '',
    type: 'button' as const,
    variant: 'ghost' as const,
    size: 'sm' as const,
    iconOnly: true,
    'aria-label': dismiss?.label,
    onClick: dismiss?.onDismiss,
  };
  return createElement(
    'div',
    {
      ...props,
      ref,
      'data-vf-feedback': '',
      'data-vf-feedback-severity': severity,
      'data-vf-alert': '',
      'data-vf-alert-variant': variant,
    },
    icon == null ? null : createElement('span', { 'data-vf-alert-icon': '', 'aria-hidden': true }, icon),
    createElement(
      'div',
      { 'data-vf-alert-message': '', role },
      heading == null ? null : createElement('div', { 'data-vf-alert-heading': '' }, heading),
      children,
    ),
    actions == null ? null : createElement('div', { 'data-vf-alert-actions': '' }, actions),
    dismiss == null ? null : createElement(Button, dismissProps, createElement('span', { 'aria-hidden': true }, '×')),
  );
});
