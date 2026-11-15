const groupSelector = '[data-vf-tag-group-root],vf-tag-group';
const removeSelector = 'button[data-vf-tag-group-remove]';

function attachRemovalFocus(root: HTMLElement): () => void {
  let focused: HTMLButtonElement | null = null;
  let ordered: HTMLButtonElement[] = [];
  const owns = (button: HTMLButtonElement) => button.closest(groupSelector) === root;
  const buttons = () => Array.from(root.querySelectorAll<HTMLButtonElement>(removeSelector)).filter(owns);
  const eligible = (button: HTMLButtonElement) =>
    button.isConnected &&
    owns(button) &&
    !button.matches(':disabled,[aria-disabled="true"]') &&
    !button.closest('[hidden],[inert]') &&
    button.getClientRects().length > 0;
  const clear = () => {
    focused = null;
    ordered = [];
  };
  const capture = (target: EventTarget | null) => {
    const button = target instanceof Element ? target.closest<HTMLButtonElement>(removeSelector) : null;
    if (!button || !owns(button)) {
      clear();
      return;
    }
    focused = button;
    ordered = buttons();
  };
  const onFocusin = (event: FocusEvent) => capture(event.target);
  const onFocusout = (event: FocusEvent) => {
    const previous = focused;
    if (!previous) return;
    if (event.relatedTarget instanceof Element && !root.contains(event.relatedTarget)) {
      clear();
      return;
    }
    queueMicrotask(() => {
      if (focused === previous && owns(previous) && root.ownerDocument.activeElement !== previous) clear();
    });
  };
  const observer = new MutationObserver(() => {
    if (!focused || !root.isConnected) return;
    const active = root.ownerDocument.activeElement;
    if (owns(focused)) {
      if (active === focused) ordered = buttons();
      return;
    }
    const index = ordered.indexOf(focused);
    const candidates = [...ordered.slice(index + 1), ...ordered.slice(0, index).reverse()];
    clear();
    if (active && active !== root && active !== root.ownerDocument.body) return;
    (candidates.find(eligible) ?? root).focus();
  });
  root.addEventListener('focusin', onFocusin);
  root.addEventListener('focusout', onFocusout);
  observer.observe(root, { childList: true, subtree: true });
  capture(root.ownerDocument.activeElement);
  return () => {
    observer.disconnect();
    root.removeEventListener('focusin', onFocusin);
    root.removeEventListener('focusout', onFocusout);
    clear();
  };
}

const H: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
export class VfTagGroupElement extends H {
  private cleanup: (() => void) | undefined;
  private observer: MutationObserver | undefined;
  connectedCallback(): void {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'list');
    if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
    this.setAttribute('data-vf-tag-group-root', '');
    this.syncItems();
    if (typeof MutationObserver !== 'undefined') {
      this.cleanup = attachRemovalFocus(this);
      this.observer = new MutationObserver(() => this.syncItems());
      this.observer.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-vf-tag-group-item'],
      });
    }
  }
  disconnectedCallback(): void {
    this.cleanup?.();
    this.cleanup = undefined;
    this.observer?.disconnect();
    this.observer = undefined;
  }
  private syncItems(): void {
    for (const item of this.querySelectorAll<HTMLElement>('[data-vf-tag-group-item]')) {
      if (item.closest(groupSelector) === this && !item.hasAttribute('role')) item.setAttribute('role', 'listitem');
    }
  }
}
export function defineTagGroupElement(
  tag = 'vf-tag-group',
  registry: CustomElementRegistry | undefined = globalThis.customElements,
) {
  if (!registry) throw new Error('VyrnForge TagGroup registration requires a CustomElementRegistry.');
  if (!registry.get(tag)) registry.define(tag, VfTagGroupElement);
}
