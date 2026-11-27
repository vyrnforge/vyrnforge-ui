/** Presentation only: native input owns value, focus, keyboard, pointer and forms. */
export interface SliderPresentationOptions {
  marks?: boolean | readonly { value: number; label?: string }[];
  valueLabelDisplay?: 'off' | 'auto' | 'always';
  formatValue?: ((value: number) => string) | undefined;
}
export interface SliderConnection {
  /** Read the actual native value; call after direct programmatic value writes. */
  refresh(options?: SliderPresentationOptions): void;
  disconnect(): void;
}
function numericAttribute(raw: string, fallback: number): number {
  return raw.trim() && Number.isFinite(Number(raw)) ? Number(raw) : fallback;
}
function fraction(value: number, min: number, max: number): number {
  return max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;
}
function marksFor(options: SliderPresentationOptions, min: number, max: number, step: string): readonly { value: number; label?: string }[] {
  if (options.marks === true && step !== 'any') {
    const increment = Number(step || 1);
    const count = Math.floor((max - min) / increment + 1e-9) + 1;
    if (increment > 0 && count > 0 && count <= 50) {
      return Array.from({ length: count }, (_, i) => ({ value: Number((min + i * increment).toPrecision(15)) }));
    }
  }
  if (Array.isArray(options.marks)) {
    return options.marks.filter(mark => Number.isFinite(mark.value) && mark.value >= min && mark.value <= max)
      .slice(0, 50);
  }
  return [];
}

/**
 * Opt-in native enhancement. The input stays in its authored DOM position.
 * For marks or a value label, author a direct parent with data-vf-slider-presentation.
 * Plain input[data-vf-slider] remains usable without this connection.
 */
export function connectSlider(input: HTMLInputElement, initial: SliderPresentationOptions = {}): SliderConnection {
  if (input.type !== 'range') throw new TypeError('Slider requires a native range input');
  const doc = input.ownerDocument;
  const parent = input.parentElement;
  const host = parent?.hasAttribute('data-vf-slider-presentation') ? parent : null;
  let options = initial;
  let active = true;
  let scheduled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let ticks: HTMLElement | undefined;
  let bubble: HTMLElement | undefined;
  let markKey = '';
  let generatedValueText: string | undefined;
  let authoredValueText = input.getAttribute('aria-valuetext');
  let observer: ResizeObserver | undefined;
  let markObserver: ResizeObserver | undefined;
  let geometryKey = '';
  const span = (attribute: string) => {
    const node = doc.createElement('span');
    node.setAttribute(attribute, '');
    return node;
  };
  const measure = () => {
    if (!host || !bubble) return;
    const width = bubble.getBoundingClientRect().width;
    const height = bubble.getBoundingClientRect().height;
    if (width > 0) host.style.setProperty('--_vf-slider-label-width', width + 'px');
    if (height > 0) host.style.setProperty('--_vf-slider-label-height', height + 'px');
  };
  // Keep ticks at their authored values. At constrained widths, retain endpoint
  // labels first, clamp them into the available bounds and suppress collisions.
  const fitMarks = () => {
    if (!host || !ticks || !active) return;
    const vertical = host.getAttribute('data-vf-orientation') === 'vertical';
    const bounds = host.getBoundingClientRect();
    const rtl = host.matches(':dir(rtl)');
    const labels = Array.from(ticks.querySelectorAll<HTMLElement>('[data-vf-slider-mark-label]'));
    if (!labels.length || bounds.width <= 0 || bounds.height <= 0) return;
    for (const label of labels) {
      label.style.removeProperty('visibility');
      label.style.removeProperty('--_vf-slider-mark-shift');
    }
    const entries = labels.map(label => {
      const rect = label.getBoundingClientRect();
      const delta = vertical ? 0 : Math.max(bounds.left - rect.left,
        Math.min(0, bounds.right - rect.right));
      const shift = !vertical && rect.left + delta < bounds.left ? bounds.left - rect.left : delta;
      if (!vertical && shift) label.style.setProperty('--_vf-slider-mark-shift', (rtl ? -shift : shift) + 'px');
      return { label, position: Number(label.parentElement?.style.getPropertyValue('--_vf-slider-position')), start: vertical ? rect.top : rect.left + shift, end: vertical ? rect.bottom : rect.right + shift };
    }).sort((a, b) => a.position - b.position);
    const ordered = entries.length > 1 ? [entries[0]!, entries[entries.length - 1]!, ...entries.slice(1, -1)] : entries;
    const retained: { start: number; end: number }[] = [];
    for (const entry of ordered) {
      const lower = vertical ? bounds.top : bounds.left;
      const upper = vertical ? bounds.bottom : bounds.right;
      if (entry.start < lower - 0.5 || entry.end > upper + 0.5 ||
          retained.some(other => entry.start < other.end + 4 && entry.end > other.start - 4)) {
        entry.label.style.visibility = 'hidden';
      } else retained.push(entry);
    }
  };
  const refresh = (next?: SliderPresentationOptions) => {
    if (!active) return;
    if (next) options = next;
    const min = numericAttribute(input.min, 0);
    const max = Math.max(min, numericAttribute(input.max, 100));
    const value = input.valueAsNumber;
    if (!Number.isFinite(value)) return;
    const progress = String(fraction(value, min, max));
    input.style.setProperty('--_vf-slider-progress', progress);
    input.setAttribute('data-vf-slider-enhanced', '');
    const formatted = options.formatValue?.(value);
    // Preserve an explicitly authored accessible interpretation.
    const existing = input.getAttribute('aria-valuetext');
    if (existing !== (generatedValueText ?? authoredValueText)) authoredValueText = existing;
    if (authoredValueText === null && formatted !== undefined) {
      if (existing !== formatted) input.setAttribute('aria-valuetext', formatted);
      generatedValueText = formatted;
    } else if (generatedValueText !== undefined) {
      if (existing === generatedValueText) {
        if (authoredValueText === null) input.removeAttribute('aria-valuetext');
        else input.setAttribute('aria-valuetext', authoredValueText);
      }
      generatedValueText = undefined;
    }
    if (!host) return;
    host.style.setProperty('--_vf-slider-progress', progress);
    host.setAttribute('data-vf-size', input.getAttribute('data-vf-size') || 'md');
    host.setAttribute('data-vf-orientation', input.getAttribute('data-vf-orientation') || 'horizontal');
    const display = options.valueLabelDisplay ?? 'off';
    host.setAttribute('data-vf-value-label', display);
    const marks = marksFor(options, min, max, input.step);
    host.toggleAttribute('data-vf-slider-marks', marks.length > 0);
    const key = JSON.stringify([min, max, marks]);
    if (key !== markKey) {
      markObserver?.disconnect();
      markObserver = undefined;
      ticks?.remove();
      ticks = undefined;
      markKey = key;
      if (marks.length) {
        ticks = span('data-vf-slider-ticks');
        ticks.setAttribute('aria-hidden', 'true');
        for (const mark of marks) {
          const tick = span('data-vf-slider-mark');
          tick.style.setProperty('--_vf-slider-position', String(fraction(mark.value, min, max)));
          tick.append(span('data-vf-slider-mark-dot'));
          if (mark.label !== undefined) {
            const label = span('data-vf-slider-mark-label');
            label.textContent = mark.label;
            tick.append(label);
          }
          ticks.append(tick);
        }
        host.append(ticks);
        if (doc.defaultView?.ResizeObserver) {
          markObserver = new doc.defaultView.ResizeObserver(fitMarks);
          markObserver.observe(host);
          for (const label of ticks.querySelectorAll('[data-vf-slider-mark-label]')) markObserver.observe(label);
        }
        fitMarks();
      }
    }
    const nextGeometry = [host.getAttribute('data-vf-orientation'), host.getAttribute('data-vf-size'), key].join('|');
    if (geometryKey !== nextGeometry) { geometryKey = nextGeometry; fitMarks(); }
    if (display === 'off') {
      observer?.disconnect();
      observer = undefined;
      bubble?.remove();
      bubble = undefined;
    } else {
      if (!bubble) {
        bubble = span('data-vf-slider-value');
        bubble.setAttribute('aria-hidden', 'true');
        host.append(bubble);
        if (doc.defaultView?.ResizeObserver) {
          observer = new doc.defaultView.ResizeObserver(measure);
          observer.observe(bubble);
        }
      }
      const label = formatted ?? String(value);
      if (bubble.textContent !== label) bubble.textContent = label;
      measure();
    }
  };
  const schedule = () => {
    if (!active || scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; refresh(); });
  };
  const onInput = () => { refresh(); schedule(); };
  const onReset = (event: Event) => {
    if (event.target !== input.form) return;
    clearTimeout(timer);
    timer = setTimeout(() => { if (!event.defaultPrevented) refresh(); }, 0);
  };
  const Mutation = doc.defaultView?.MutationObserver;
  const mutation = Mutation ? new Mutation(schedule) : undefined;
  mutation?.observe(input, { attributes: true, attributeFilter: ['min', 'max', 'step', 'value', 'disabled', 'data-vf-size', 'data-vf-orientation', 'aria-valuetext'] });
  input.addEventListener('input', onInput);
  input.addEventListener('change', onInput);
  doc.addEventListener('reset', onReset, true);
  refresh();
  return {
    refresh,
    disconnect() {
      if (!active) return;
      active = false;
      clearTimeout(timer);
      mutation?.disconnect();
      observer?.disconnect();
      markObserver?.disconnect();
      input.removeEventListener('input', onInput);
      input.removeEventListener('change', onInput);
      doc.removeEventListener('reset', onReset, true);
      input.removeAttribute('data-vf-slider-enhanced');
      input.style.removeProperty('--_vf-slider-progress');
      if (generatedValueText !== undefined && input.getAttribute('aria-valuetext') === generatedValueText) {
        if (authoredValueText === null) input.removeAttribute('aria-valuetext');
        else input.setAttribute('aria-valuetext', authoredValueText);
      }
      ticks?.remove();
      bubble?.remove();
      if (host) {
        host.removeAttribute('data-vf-slider-marks');
        host.removeAttribute('data-vf-value-label');
        for (const property of ['--_vf-slider-progress', '--_vf-slider-label-width', '--_vf-slider-label-height'])
          host.style.removeProperty(property);
      }
    },
  };
}
