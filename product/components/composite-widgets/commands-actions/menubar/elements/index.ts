import { navigationIntentForArrow, resolveNavigationIndex } from '@vyrnforge/core/collection-navigation';

const rootSelector = '[data-vf-menubar-root]';
const triggerSelector = '[data-vf-menubar-trigger]';

function triggers(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll<HTMLButtonElement>(triggerSelector)).filter(
    (item) => item.closest(rootSelector) === root,
  );
}

function triggerFromTarget(root: HTMLElement, target: EventTarget | null): HTMLButtonElement | null {
  const item = target instanceof HTMLElement ? target.closest<HTMLButtonElement>(triggerSelector) : null;
  return item?.closest(rootSelector) === root ? item : null;
}

function syncTabStops(root: HTMLElement, preferred?: HTMLButtonElement | null): void {
  const items = triggers(root);
  const eligible = items.filter((item) => !item.matches(':disabled'));
  const remembered = eligible.find((item) => item.tabIndex === 0);
  const active = preferred && eligible.includes(preferred) ? preferred : (remembered ?? eligible[0]);
  for (const item of items) {
    const tabIndex = item === active ? 0 : -1;
    if (!item.hasAttribute('tabindex') || item.tabIndex !== tabIndex) item.tabIndex = tabIndex;
  }
}

type NavigationEvent = Pick<KeyboardEvent, 'key' | 'defaultPrevented' | 'preventDefault'>;
function moveFocus(root: HTMLElement, current: HTMLButtonElement, event: NavigationEvent): void {
  if (event.defaultPrevented) return;
  const direction = getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
  const intent =
    event.key === 'Home'
      ? 'first'
      : event.key === 'End'
        ? 'last'
        : event.key === 'ArrowLeft' || event.key === 'ArrowRight'
          ? navigationIntentForArrow(event.key === 'ArrowLeft' ? 'left' : 'right', 'horizontal', direction)
          : null;
  if (!intent) return;
  const items = triggers(root);
  const index = items.indexOf(current);
  if (index < 0) return;
  const next = resolveNavigationIndex(
    items.map((item) => ({ eligible: !item.matches(':disabled') })),
    index,
    intent,
  );
  if (next == null) return;
  const item = items[next];
  if (!item) return;
  event.preventDefault();
  syncTabStops(root, item);
  item.focus();
}

function observeTriggers(root: HTMLElement): MutationObserver {
  const observer = new MutationObserver(() => {
    syncTabStops(root, triggerFromTarget(root, root.ownerDocument.activeElement));
  });
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'data-vf-menubar-trigger', 'data-vf-menubar-root'],
  });
  return observer;
}

const HTMLElementBase: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
export class VfMenubarElement extends HTMLElementBase {
  private observer: MutationObserver | undefined;
  connectedCallback() {
    this.setAttribute('role', 'menubar');
    this.setAttribute('data-vf-menubar-root', '');
    this.addEventListener('keydown', this.onKeydown);
    this.addEventListener('focusin', this.onFocusin);
    syncTabStops(this);
    if (typeof MutationObserver !== 'undefined') this.observer = observeTriggers(this);
  }
  disconnectedCallback() {
    this.removeEventListener('keydown', this.onKeydown);
    this.removeEventListener('focusin', this.onFocusin);
    this.observer?.disconnect();
    this.observer = undefined;
  }
  private onFocusin = (event: FocusEvent) => {
    const item = triggerFromTarget(this, event.target);
    if (item) syncTabStops(this, item);
  };
  private onKeydown = (event: KeyboardEvent) => {
    const item = triggerFromTarget(this, event.target);
    if (item) moveFocus(this, item, event);
  };
}
export function defineMenubarElement(
  tagName = 'vf-menubar',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge Menubar registration requires a CustomElementRegistry.');
  if (!registry.get(tagName)) registry.define(tagName, VfMenubarElement);
}
