import { createElement, forwardRef, type ComponentPropsWithoutRef } from 'react';
import type { FeedbackSeverity } from '../../internal/feedback.js';
export type { FeedbackSeverity } from '../../internal/feedback.js';

export interface StatusIndicatorProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'role' | 'aria-live' | 'tabIndex'> {
  children: string;
  severity?: FeedbackSeverity;
}

/** Compact inline status with a visible label and a decorative dot; not a live region. */
export const StatusIndicator = forwardRef<HTMLSpanElement, StatusIndicatorProps>(function StatusIndicator(
  { children, severity, ...props }, ref,
) {
  return createElement('span', { ...props, ref, 'data-vf-feedback': '', 'data-vf-feedback-severity': severity,
    'data-vf-status-indicator': '' },
    createElement('span', { 'data-vf-status-indicator-dot': '', 'aria-hidden': true }),
    children);
});
