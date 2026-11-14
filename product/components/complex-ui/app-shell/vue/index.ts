import { defineComponent,h } from 'vue';
function region(name:string,tag:string,hook:string){return defineComponent({name,inheritAttrs:false,setup(_,{attrs,slots}){return()=>h(tag,{...attrs,[hook]:''},slots.default?.());}})}
export const AppShell=region('VfAppShell','div','data-vf-app-shell');
export const AppShellHeader=region('VfAppShellHeader','header','data-vf-app-shell-header');
export const AppShellBody=region('VfAppShellBody','div','data-vf-app-shell-body');
export const AppShellNavigation=region('VfAppShellNavigation','aside','data-vf-app-shell-navigation');
export const AppShellMain=region('VfAppShellMain','main','data-vf-app-shell-main');
export const AppShellFooter=region('VfAppShellFooter','footer','data-vf-app-shell-footer');
