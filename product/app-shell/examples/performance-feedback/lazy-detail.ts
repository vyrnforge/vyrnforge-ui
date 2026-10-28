const performanceGlobal = globalThis as typeof globalThis & {
  __vfPerformanceDetailEvaluated?: boolean;
};

performanceGlobal.__vfPerformanceDetailEvaluated = true;

export function loadDetailSummary() {
  return 'Deferred detail capability loaded on demand. Loading this module is optional for the initial list task.';
}
