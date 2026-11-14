import { Directive, booleanAttribute, computed, input, output, signal } from '@angular/core';
@Directive({selector:'[vfPasswordFieldRoot]',standalone:true,exportAs:'vfPasswordFieldRoot',host:{'data-vf-password-field-root':''}})
export class VfPasswordFieldRootDirective {
  readonly visible=input<boolean|undefined>(undefined);
  readonly defaultVisible=input(false,{transform:booleanAttribute});
  readonly disabled=input(false,{transform:booleanAttribute});
  readonly visibleChange=output<boolean>();
  private readonly internal=signal<boolean|undefined>(undefined);
  readonly isVisible=computed(()=>this.visible()??this.internal()??this.defaultVisible());
  toggle():void {
    if(this.disabled())return;
    const next=!this.isVisible();
    if(this.visible()===undefined)this.internal.set(next);
    this.visibleChange.emit(next);
  }
}
@Directive({selector:'input[vfPasswordFieldInput]',standalone:true,host:{
  'data-vf-password-field-input':'',
  '[attr.type]':'root.isVisible() ? "text" : "password"',
  '[disabled]':'root.disabled() || disabled()',
}})
export class VfPasswordFieldInputDirective {
  readonly disabled=input(false,{transform:booleanAttribute});
  constructor(readonly root:VfPasswordFieldRootDirective){}
}
@Directive({selector:'button[vfPasswordFieldToggle]',standalone:true,host:{
  type:'button',
  'data-vf-password-field-toggle':'',
  '[attr.aria-label]':'stateLabel()',
  '[disabled]':'root.disabled() || disabled()',
  '(click)':'toggle($event)',
}})
export class VfPasswordFieldToggleDirective {
  readonly showLabel=input.required<string>();
  readonly hideLabel=input.required<string>();
  readonly disabled=input(false,{transform:booleanAttribute});
  readonly stateLabel=computed(()=>this.root.isVisible()?this.hideLabel():this.showLabel());
  constructor(readonly root:VfPasswordFieldRootDirective){}
  toggle(event:MouseEvent):void {if(!event.defaultPrevented&&!this.disabled())this.root.toggle();}
}
