import { defineComponent,h } from 'vue';
function region(name:string,tag:string,hook:string){return defineComponent({name,inheritAttrs:false,setup(_,{attrs,slots}){return()=>h(tag,{...attrs,[hook]:''},slots.default?.());}})}
export const SideNav=region('VfSideNav','nav','data-vf-side-nav');
export const SideNavGroup=region('VfSideNavGroup','section','data-vf-side-nav-group');
export const SideNavGroupLabel=region('VfSideNavGroupLabel','h2','data-vf-side-nav-group-label');
export const SideNavList=region('VfSideNavList','ul','data-vf-side-nav-list');
export const SideNavItem=region('VfSideNavItem','li','data-vf-side-nav-item');
export const SideNavLink=defineComponent({name:'VfSideNavLink',inheritAttrs:false,props:{current:{type:Boolean,default:false}},setup(props,{attrs,slots}){return()=>h('a',{...attrs,'data-vf-side-nav-link':'','data-vf-current':props.current?'true':undefined,'aria-current':props.current?'page':(attrs['aria-current'] as string|undefined)},slots.default?.());}});
