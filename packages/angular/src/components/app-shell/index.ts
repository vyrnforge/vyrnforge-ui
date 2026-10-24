import { Directive } from '@angular/core';
@Directive({selector:'[vfAppShell]',standalone:true,host:{'data-vf-app-shell':''}}) export class VfAppShellDirective {}
@Directive({selector:'header[vfAppShellHeader]',standalone:true,host:{'data-vf-app-shell-header':''}}) export class VfAppShellHeaderDirective {}
@Directive({selector:'[vfAppShellBody]',standalone:true,host:{'data-vf-app-shell-body':''}}) export class VfAppShellBodyDirective {}
@Directive({selector:'aside[vfAppShellNavigation]',standalone:true,host:{'data-vf-app-shell-navigation':''}}) export class VfAppShellNavigationDirective {}
@Directive({selector:'main[vfAppShellMain]',standalone:true,host:{'data-vf-app-shell-main':''}}) export class VfAppShellMainDirective {}
@Directive({selector:'footer[vfAppShellFooter]',standalone:true,host:{'data-vf-app-shell-footer':''}}) export class VfAppShellFooterDirective {}
