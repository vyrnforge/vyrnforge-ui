import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const root = process.cwd();
const out = path.join(root, '.qa-shell-output');
await mkdir(out, { recursive: true });
const ports = ['web', 'react', 'angular', 'vue', 'elements'];
const nativeNav = '<nav data-vf-side-nav aria-label="Primary"><section data-vf-side-nav-group><h2 data-vf-side-nav-group-label>Workspace</h2><ul data-vf-side-nav-list><li data-vf-side-nav-item><a data-vf-side-nav-link data-vf-current="true" aria-current="page" href="#home">Home</a></li><li data-vf-side-nav-item><a data-vf-side-nav-link href="#projects">Projects</a></li><li data-vf-side-nav-item><a data-vf-side-nav-link aria-current="step" href="#step">Step</a></li></ul></section></nav>';
const nativeShell = '<div data-vf-app-shell><header data-vf-app-shell-header><h1>Workspace</h1></header><div data-vf-app-shell-body><aside data-vf-app-shell-navigation>' + nativeNav + '</aside><main data-vf-app-shell-main id="home"><h2>Home content</h2></main></div><footer data-vf-app-shell-footer>Footer</footer></div>';
const elementShell = '<vf-app-shell><vf-app-shell-header><h1>Workspace</h1></vf-app-shell-header><vf-app-shell-body><vf-app-shell-navigation>' + nativeNav.replace('<nav data-vf-side-nav','<vf-side-nav').replace('</nav>','</vf-side-nav>') + '</vf-app-shell-navigation><vf-app-shell-main id="home"><h2>Home content</h2></vf-app-shell-main></vf-app-shell-body><vf-app-shell-footer>Footer</vf-app-shell-footer></vf-app-shell>';
const angularTemplate = nativeShell.replace('data-vf-app-shell=""','vfAppShell').replace('data-vf-app-shell>','vfAppShell>').replace('data-vf-app-shell-header','vfAppShellHeader').replace('data-vf-app-shell-body','vfAppShellBody').replace('data-vf-app-shell-navigation','vfAppShellNavigation').replace('data-vf-app-shell-main','vfAppShellMain').replace('data-vf-app-shell-footer','vfAppShellFooter').replace('data-vf-side-nav aria','vfSideNav aria').replace('data-vf-side-nav-group>','vfSideNavGroup>').replace('data-vf-side-nav-group-label','vfSideNavGroupLabel').replace('data-vf-side-nav-list','vfSideNavList').replaceAll('data-vf-side-nav-item','vfSideNavItem').replace('data-vf-side-nav-link data-vf-current="true" aria-current="page"','vfSideNavLink [vfSideNavCurrent]="true"').replace('data-vf-side-nav-link','vfSideNavLink');
const angularExtraTemplate = angularTemplate.replace('data-vf-side-nav-link aria-current="step"','vfSideNavLink [vfSideNavCurrent]="false" aria-current="step"');
const shellImports = 'AppShell,AppShellHeader,AppShellBody,AppShellNavigation,AppShellMain,AppShellFooter';
const navImports = 'SideNav,SideNavGroup,SideNavGroupLabel,SideNavList,SideNavItem,SideNavLink';
const reactTree = "h(AppShell,null,h(AppShellHeader,null,h('h1',null,'Workspace')),h(AppShellBody,null,h(AppShellNavigation,null,h(SideNav,{'aria-label':'Primary'},h(SideNavGroup,null,h(SideNavGroupLabel,null,'Workspace'),h(SideNavList,null,h(SideNavItem,null,h(SideNavLink,{current:true,href:'#home'},'Home')),h(SideNavItem,null,h(SideNavLink,{href:'#projects'},'Projects')),h(SideNavItem,null,h(SideNavLink,{current:false,'aria-current':'step',href:'#step'},'Step')))))),h(AppShellMain,{id:'home'},h('h2',null,'Home content'))),h(AppShellFooter,null,'Footer'))";
const vueTree = "h(AppShell,null,{default:()=>[h(AppShellHeader,null,{default:()=>h('h1','Workspace')}),h(AppShellBody,null,{default:()=>[h(AppShellNavigation,null,{default:()=>h(SideNav,{'aria-label':'Primary'},{default:()=>h(SideNavGroup,null,{default:()=>[h(SideNavGroupLabel,null,{default:()=> 'Workspace'}),h(SideNavList,null,{default:()=>[h(SideNavItem,null,{default:()=>h(SideNavLink,{current:true,href:'#home'},{default:()=> 'Home'})}),h(SideNavItem,null,{default:()=>h(SideNavLink,{href:'#projects'},{default:()=> 'Projects'})}),h(SideNavItem,null,{default:()=>h(SideNavLink,{current:false,'aria-current':'step',href:'#step'},{default:()=> 'Step'})})]})]})})}),h(AppShellMain,{id:'home'},{default:()=>h('h2','Home content')})]}),h(AppShellFooter,null,{default:()=> 'Footer'})]})";
const sources = {
 react: "import{createElement as h}from'react';import{createRoot}from'react-dom/client';import{"+shellImports+"}from'@vyrnforge/react/app-shell';import{"+navImports+"}from'@vyrnforge/react/side-nav';createRoot(document.querySelector('#root')).render("+reactTree+");",
 vue: "import{createApp,h}from'vue';import{"+shellImports+"}from'@vyrnforge/vue/app-shell';import{"+navImports+"}from'@vyrnforge/vue/side-nav';createApp({render:()=>"+vueTree+"}).mount('#root');",
 angular: "import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import*as Shell from'@vyrnforge/angular/app-shell';import*as Nav from'@vyrnforge/angular/side-nav';class App{};Component({selector:'qa-shell',standalone:true,imports:[...Object.values(Shell),...Object.values(Nav)],template:"+JSON.stringify(angularExtraTemplate)+"})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});",
 elements: "import{defineAppShellElements}from'@vyrnforge/elements/app-shell';import{defineSideNavElement}from'@vyrnforge/elements/side-nav';defineAppShellElements();defineSideNavElement();",
};
await build({stdin:{resolveDir:root,sourcefile:'qa-shell.css',loader:'css',contents:'@import "@vyrnforge/web/styles/app-shell.css";\n@import "@vyrnforge/web/styles/side-nav.css";'},bundle:true,outfile:path.join(out,'styles.css')});
for (const port of ports) {
 if (sources[port]) await build({stdin:{resolveDir:root,sourcefile:port+'.mjs',contents:sources[port]},bundle:true,format:'esm',platform:'browser',outfile:path.join(out,port+'.js')});
 const body = port==='web'?nativeShell:port==='elements'?elementShell:port==='angular'?'<qa-shell></qa-shell>':'<div id="root"></div>';
 await writeFile(path.join(out,port+'.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>QA shell</title><link rel="stylesheet" href="styles.css"><style>body{margin:0}</style></head><body>'+body+(sources[port]?'<script type="module" src="'+port+'.js"></script>':'')+'</body></html>');
}
const server=createServer(async(req,res)=>{try{const file=path.basename(new URL(req.url,'http://127.0.0.1').pathname);const data=await readFile(path.join(out,file));res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(data);}catch{res.statusCode=404;res.end('not found');}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));

const browser=await chromium.launch();
const results=[];
const base='http://127.0.0.1:'+server.address().port;
try {
 for(const port of ports){
  const context=await browser.newContext({viewport:{width:1920,height:900},reducedMotion:'reduce'});
  const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  try {
   await page.goto(base+'/'+port+'.html');
   await page.getByRole('main').waitFor(); await page.getByRole('link',{name:'Step',exact:true}).waitFor();
   const current=await page.getByRole('link',{name:'Home',exact:true}).getAttribute('aria-current');
   const step=await page.getByRole('link',{name:'Step',exact:true}).getAttribute('aria-current');
   const geom=()=>page.evaluate(()=>{const q=n=>document.querySelector('[data-vf-app-shell'+n+']');const box=n=>{const b=q(n).getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}};return{shell:box(''),body:box('-body'),main:box('-main'),columns:getComputedStyle(q('-body')).gridTemplateColumns,rows:getComputedStyle(q('')).gridTemplateRows,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};});
   const withNav=await geom();
   await page.screenshot({path:path.join(out,port+'-wide.png')});
   await page.locator('[data-vf-app-shell-navigation]').evaluate(el=>el.remove());
   const noNav=await geom();
   await page.screenshot({path:path.join(out,port+'-no-nav.png')});
   await page.setViewportSize({width:640,height:800}); const mobileNoNav=await geom();
   const heading=await page.locator('[data-vf-app-shell-header]').evaluate(el=>({tag:el.tagName,role:el.getAttribute('role')}));
   const footer=await page.locator('[data-vf-app-shell-footer]').evaluate(el=>({tag:el.tagName,role:el.getAttribute('role')}));
   assert.equal(current,'page'); assert.equal(withNav.shell.width,1920); assert.equal(withNav.body.width,1920);
   assert.deepEqual(errors,[]);
   results.push({port,current,authoredStep:step,withNav,noNav,mobileNoNav,heading,footer,errors});
  }finally{await context.close()}
 }
 const context=await browser.newContext({viewport:{width:1920,height:900}});const page=await context.newPage();
 const docs='http://127.0.0.1:4173/next/native-web/components/button/';
 await page.goto(docs);await page.getByRole('heading',{level:1,name:'Button'}).waitFor();
 const wide=await page.evaluate(()=>{const q=s=>document.querySelector(s);const b=s=>q(s).getBoundingClientRect().toJSON();return{viewport:innerWidth,shell:b('[data-vf-app-shell]'),body:b('[data-vf-app-shell-body]'),main:b('main'),cap:getComputedStyle(q('[data-vf-docs-shell]')).getPropertyValue('--vf-app-shell-max-inline-size'),nav:b('#vf-docs-navigation')};});
 await page.screenshot({path:path.join(out,'docs-wide.png')});
 const link=page.locator('#vf-docs-navigation a[aria-current="page"]'); await link.focus();assert.ok(await link.evaluate(el=>document.activeElement===el));
 await page.setViewportSize({width:640,height:800}); await page.waitForFunction(()=>document.querySelector('[data-vf-docs-nav-toggle]').getAttribute('aria-expanded')==='false');
 const collapseFocus=await page.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent?.slice(0,80),navVisible:getComputedStyle(document.querySelector('#vf-docs-navigation')).display}));
 await page.getByRole('button',{name:'Menu'}).click(); await link.focus(); await page.keyboard.press('Tab'); const nextFocus=await page.evaluate(()=>document.activeElement.outerHTML.slice(0,250));
 await page.getByRole('button',{name:'Menu'}).focus();await page.setViewportSize({width:1440,height:900});await page.waitForFunction(()=>document.querySelector('[data-vf-docs-nav-toggle]').getAttribute('aria-expanded')==='true');const expandFocus=await page.evaluate(()=>({tag:document.activeElement.tagName,html:document.activeElement.outerHTML.slice(0,200)}));
 results.push({port:'docs',wide,collapseFocus,expandFocus,nextFocus});
 await context.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:720}});const np=await nojs.newPage();await np.goto(docs);results.push({port:'docs-no-js',navigationVisible:await np.locator('#vf-docs-navigation').isVisible(),current:await np.locator('#vf-docs-navigation a[aria-current="page"]').textContent(),menuVisible:await np.getByRole('button',{name:'Menu'}).isVisible()});await nojs.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
await writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
