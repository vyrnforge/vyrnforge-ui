import { createElement, createRef } from 'react';
import { StatusIndicator, type FeedbackSeverity } from '@vyrnforge/react/status-indicator';
const severity: FeedbackSeverity = 'critical';
void createElement(StatusIndicator, { children: 'Service unavailable', severity, ref: createRef<HTMLSpanElement>() });
// @ts-expect-error status needs visible text
void createElement(StatusIndicator, { severity });
// @ts-expect-error not an implicit live region
void createElement(StatusIndicator, { children: 'Idle', role: 'status' });
