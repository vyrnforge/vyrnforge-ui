/**
 * Synchronize a decorative arrow with the browser-resolved native popover.
 * The browser retains ownership of placement, collision handling and focus.
 * Connect only after opening; disconnect when closing or removing the surface.
 */
export function connectTooltipArrow(surface: HTMLElement, trigger: HTMLElement): () => void {
  const view = surface.ownerDocument.defaultView;
  if (!view) return () => undefined;
  let frame = 0;
  let active = true;
  const clear = () => {
    surface.removeAttribute('data-vf-tooltip-side');
    surface.style.removeProperty('--_vf-tooltip-arrow-position');
  };
  const update = () => {
    if (!active) return;
    if (!surface.hasAttribute('data-vf-arrow') || !surface.matches(':popover-open')) {
      clear();
      return;
    }
    const a = trigger.getBoundingClientRect();
    const b = surface.getBoundingClientRect();
    const current = surface.getAttribute('data-vf-tooltip-side');
    const arrow = view.getComputedStyle(surface, '::after');
    const extraHeight = current === 'top' || current === 'bottom' ? parseFloat(arrow.height) || 0 : 0;
    const extraWidth = current === 'left' || current === 'right' ? parseFloat(arrow.width) || 0 : 0;
    // A clipped/scrollable surface or an overlapping fallback must not show a misleading pointer.
    if (
      !a.width ||
      !a.height ||
      !b.width ||
      !b.height ||
      surface.scrollHeight > surface.clientHeight + extraHeight + 2 ||
      surface.scrollWidth > surface.clientWidth + extraWidth + 2
    ) {
      clear();
    } else {
      const sides = [
        { side: 'top', gap: a.top - b.bottom, position: a.left + a.width / 2 - b.left, length: b.width },
        { side: 'bottom', gap: b.top - a.bottom, position: a.left + a.width / 2 - b.left, length: b.width },
        { side: 'left', gap: a.left - b.right, position: a.top + a.height / 2 - b.top, length: b.height },
        { side: 'right', gap: b.left - a.right, position: a.top + a.height / 2 - b.top, length: b.height },
      ];
      const resolved = sides.filter((side) => side.gap >= -1).sort((a, b) => b.gap - a.gap)[0];
      if (!resolved || resolved.position < 0 || resolved.position > resolved.length) clear();
      else {
        if (current !== resolved.side) surface.setAttribute('data-vf-tooltip-side', resolved.side);
        const position = Math.round(resolved.position * 10) / 10 + 'px';
        if (surface.style.getPropertyValue('--_vf-tooltip-arrow-position') !== position)
          surface.style.setProperty('--_vf-tooltip-arrow-position', position);
      }
    }
    frame = view.requestAnimationFrame(update);
  };
  const restart = () => {
    view.cancelAnimationFrame(frame);
    update();
  };
  const observer = new view.MutationObserver(restart);
  observer.observe(surface, {
    attributes: true,
    attributeFilter: ['data-vf-arrow', 'data-vf-size', 'data-vf-placement'],
  });
  update();
  return () => {
    active = false;
    observer.disconnect();
    view.cancelAnimationFrame(frame);
    clear();
  };
}
