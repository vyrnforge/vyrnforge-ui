import { Directive, ElementRef, inject, input, type AfterViewInit, type OnDestroy } from '@angular/core';
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

@Directive({
  selector: '[vfTagGroupRoot]',
  standalone: true,
  host: { role: 'list', tabindex: '-1', 'data-vf-tag-group-root': '' },
})
export class VfTagGroupRootDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private cleanup: (() => void) | undefined;
  ngAfterViewInit(): void {
    if (typeof MutationObserver !== 'undefined') this.cleanup = attachRemovalFocus(this.element.nativeElement);
  }
  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
@Directive({ selector: '[vfTagGroupItem]', standalone: true, host: { role: 'listitem', 'data-vf-tag-group-item': '' } })
export class VfTagGroupItemDirective {}
@Directive({
  selector: 'button[vfTagGroupRemove]',
  standalone: true,
  host: { type: 'button', 'data-vf-tag-group-remove': '', '[attr.aria-label]': 'ariaLabel() ?? label() ?? null' },
})
export class VfTagGroupRemoveDirective {
  readonly label = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
}
