const HTMLElementBase=(globalThis.HTMLElement??class{}) as typeof HTMLElement;
function defineRole(element:HTMLElement,role:string){if(!element.hasAttribute('role'))element.setAttribute('role',role);}
export class VfAppShellElement extends HTMLElementBase{connectedCallback(){this.setAttribute('data-vf-app-shell','');}}
export class VfAppShellHeaderElement extends HTMLElementBase{connectedCallback(){this.setAttribute('data-vf-app-shell-header','');defineRole(this,'banner');}}
export class VfAppShellBodyElement extends HTMLElementBase{connectedCallback(){this.setAttribute('data-vf-app-shell-body','');}}
export class VfAppShellNavigationElement extends HTMLElementBase{connectedCallback(){this.setAttribute('data-vf-app-shell-navigation','');}}
export class VfAppShellMainElement extends HTMLElementBase{connectedCallback(){this.setAttribute('data-vf-app-shell-main','');defineRole(this,'main');}}
export class VfAppShellFooterElement extends HTMLElementBase{connectedCallback(){this.setAttribute('data-vf-app-shell-footer','');defineRole(this,'contentinfo');}}
function define(registry:CustomElementRegistry|undefined,name:string,ctor:CustomElementConstructor){if(!registry)throw new Error('VyrnForge Elements AppShell registration requires a CustomElementRegistry.');if(!registry.get(name))registry.define(name,ctor);}
export function defineAppShellElements(registry:CustomElementRegistry|undefined=globalThis.customElements){define(registry,'vf-app-shell',VfAppShellElement);define(registry,'vf-app-shell-header',VfAppShellHeaderElement);define(registry,'vf-app-shell-body',VfAppShellBodyElement);define(registry,'vf-app-shell-navigation',VfAppShellNavigationElement);define(registry,'vf-app-shell-main',VfAppShellMainElement);define(registry,'vf-app-shell-footer',VfAppShellFooterElement);}
