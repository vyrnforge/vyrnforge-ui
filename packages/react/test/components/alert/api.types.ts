import { createElement, createRef } from 'react';
import { Alert, type FeedbackSeverity } from '@vyrnforge/react/alert';
const severity: FeedbackSeverity = 'error';
void createElement(Alert, { severity, announcement: 'polite', ref: createRef<HTMLDivElement>(), dismiss: { label: 'Dismiss', onDismiss() {} } }, 'Not saved');
// @ts-expect-error named dismissal required
void createElement(Alert, { dismiss: { onDismiss() {} } });
// @ts-expect-error arbitrary paint is not a severity
void createElement(Alert, { severity: 'red' });
