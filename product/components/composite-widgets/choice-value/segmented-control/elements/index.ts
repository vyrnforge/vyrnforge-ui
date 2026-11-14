const H: typeof HTMLElement = globalThis.HTMLElement ?? (class {} as typeof HTMLElement);
// Native radio controls remain the authored semantic and form baseline.
export class VfSegmentedControlElement extends H {
  connectedCallback():void {
    this.setAttribute('role','radiogroup');
    this.setAttribute('data-vf-segmented-control-root','');
  }
}
export function defineSegmentedControlElement(tag='vf-segmented-control',registry:CustomElementRegistry|undefined=globalThis.customElements):void {
  if(!registry)throw new Error('VyrnForge SegmentedControl registration requires a CustomElementRegistry.');
  if(!registry.get(tag))registry.define(tag,VfSegmentedControlElement);
}
