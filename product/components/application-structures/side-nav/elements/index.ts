const HTMLElementBase=(globalThis.HTMLElement??class{}) as typeof HTMLElement;
export class VfSideNavElement extends HTMLElementBase{connectedCallback(){this.setAttribute('data-vf-side-nav','');if(!this.hasAttribute('role'))this.setAttribute('role','navigation');}}
export function defineSideNavElement(registry:CustomElementRegistry|undefined=globalThis.customElements){if(!registry)throw new Error('VyrnForge Elements SideNav registration requires a CustomElementRegistry.');if(!registry.get('vf-side-nav'))registry.define('vf-side-nav',VfSideNavElement);}
