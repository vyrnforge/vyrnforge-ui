import { Directive, EmbeddedViewRef, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

@Directive({
  selector: 'ng-template[vfPortal]',
  standalone: true,
})
export class VfPortalDirective {
  readonly target = input<Element | DocumentFragment | null>(null, { alias: 'vfPortal' });
  private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private view: EmbeddedViewRef<unknown> | null = null;
  private mountedTarget: Element | DocumentFragment | null = null;

  constructor() {
    effect(() => this.render(this.target()));
  }

  private ensureView(): EmbeddedViewRef<unknown> {
    if (!this.view) this.view = this.viewContainer.createEmbeddedView(this.template);
    return this.view;
  }

  private render(target: Element | DocumentFragment | null): void {
    if (target === this.mountedTarget && this.view) return;
    if (!target && this.mountedTarget) {
      this.viewContainer.clear();
      this.view = null;
    }
    const view = this.ensureView();
    if (target) {
      for (const node of view.rootNodes as Node[]) target.appendChild(node);
    }
    this.mountedTarget = target;
  }
}
