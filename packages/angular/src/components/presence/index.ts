import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import type { EmbeddedViewRef } from '@angular/core';

export type PresenceState = 'entered' | 'exiting' | 'exited';
export interface VfPresenceContext {
  $implicit: PresenceState;
  state: PresenceState;
  completeExit: () => void;
}

@Directive({ selector: '[vfPresence]', standalone: true, exportAs: 'vfPresence' })
export class VfPresenceDirective {
  readonly present = input(false, { alias: 'vfPresence' });
  private readonly template = inject<TemplateRef<VfPresenceContext>>(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private view: EmbeddedViewRef<VfPresenceContext> | null = null;
  private state: PresenceState = 'exited';

  constructor() { effect(() => this.sync(this.present())); }

  private createView(): void {
    if (this.view) return;
    const context: VfPresenceContext = { $implicit: this.state, state: this.state, completeExit: () => this.completeExit() };
    this.view = this.viewContainer.createEmbeddedView(this.template, context);
  }

  private updateContext(): void {
    if (!this.view) return;
    this.view.context.$implicit = this.state;
    this.view.context.state = this.state;
    this.view.detectChanges();
  }

  private sync(present: boolean): void {
    if (present) {
      this.state = 'entered';
      this.createView();
      this.updateContext();
    } else if (this.view) {
      this.state = 'exiting';
      this.updateContext();
    }
  }

  completeExit(): void {
    if (this.present() || !this.view) return;
    this.viewContainer.clear();
    this.view = null;
    this.state = 'exited';
  }

  static ngTemplateContextGuard(_directive: VfPresenceDirective, context: unknown): context is VfPresenceContext { return Boolean(context); }
}
