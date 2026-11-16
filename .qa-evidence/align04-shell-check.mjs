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
const nativeNav = '<nav data-vf-side-nav aria-label="Primary"><section data-vf-side-nav-group><h2 data-vf-side-nav-group-label>Workspace</h2><ul data-vf-side-nav-list><li data-vf-side-nav-item><a data-vf-side-nav-link data-vf-current="true" aria-current="page" href="#home">Home</a></li><li data-vf-side-nav-item><a data-vf-side-nav-link href="#projects">Projects</a></li></ul></section></nav>';
const nativeShell = '<div data-vf-app-shell><header data-vf-app-shell-header><h1>Workspace</h1></header><div data-vf-app-shell-body><aside data-vf-app-shell-navigation>' + nativeNav + '</aside><main data-vf-app-shell-main id="home"><h2>Home content</h2></main></div><footer data-vf-app-shell-footer>Footer</footer></div>';
const elementShell = '<vf-app-shell><vf-app-shell-header><h1>Workspace</h1></vf-app-shell-header><vf-app-shell-body><vf-app-shell-navigation>' + nativeNav.replace('<nav data-vf-side-nav','<vf-side-nav').replace('</nav>','</vf-side-nav>') + '</vf-app-shell-navigation><vf-app-shell-main id="home"><h2>Home content</h2></vf-app-shell-main></vf-app-shell-body><vf-app-shell-footer>Footer</vf-app-shell-footer></vf-app-shell>';
const angularTemplate = nativeShell.replace('data-vf-app-shell=""','vfAppShell').replace('data-vf-app-shell>','vfAppShell>').replace('data-vf-app-shell-header','vfAppShellHeader').replace('data-vf-app-shell-body','vfAppShellBody').replace('data-vf-app-shell-navigation','vfAppShellNavigation').replace('data-vf-app-shell-main','vfAppShellMain').replace('data-vf-app-shell-footer','vfAppShellFooter').replace('data-vf-side-nav aria','vfSideNav aria').replace('data-vf-side-nav-group>','vfSideNavGroup>').replace('data-vf-side-nav-group-label','vfSideNavGroupLabel').replace('data-vf-side-nav-list','vfSideNavList').replaceAll('data-vf-side-nav-item','vfSideNavItem').replace('data-vf-side-nav-link data-vf-current="true" aria-current="page"','vfSideNavLink [vfSideNavCurrent]="true"').replace('data-vf-side-nav-link','vfSideNavLink');
const shellImports = 'AppShell,AppShellHeader,AppShellBody,AppShellNavigation,AppShellMain,AppShellFooter';
const navImports = 'SideNav,SideNavGroup,SideNavGroupLabel,SideNavList,SideNavItem,SideNavLink';
const reactTree = "h(AppShell,null,h(AppShellHeader,null,h('h1',null,'Workspace')),h(AppShellBody,null,h(AppShellNavigation,null,h(SideNav,{'aria-label':'Primary'},h(SideNavGroup,null,h(SideNavGroupLabel,null,'Workspace'),h(SideNavList,null,h(SideNavItem,null,h(SideNavLink,{current:true,href:'#home'},'Home')),h(SideNavItem,null,h(SideNavLink,{href:'#projects'},'Projects')))))),h(AppShellMain,{id:'home'},h('h2',null,'Home content'))),h(AppShellFooter,null,'Footer'))";
const vueTree = "h(AppShell,null,{default:()=>[h(AppShellHeader,null,{default:()=>h('h1','Workspace')}),h(AppShellBody,null,{default:()=>[h(AppShellNavigation,null,{default:()=>h(SideNav,{'aria-label':'Primary'},{default:()=>h(SideNavGroup,null,{default:()=>[h(SideNavGroupLabel,null,{default:()=> 'Workspace'}),h(SideNavList,null,{default:()=>[h(SideNavItem,null,{default:()=>h(SideNavLink,{current:true,href:'#home'},{default:()=> 'Home'})}),h(SideNavItem,null,{default:()=>h(SideNavLink,{href:'#projects'},{default:()=> 'Projects'})})]})]})})}),h(AppShellMain,{id:'home'},{default:()=>h('h2','Home content')})]}),h(AppShellFooter,null,{default:()=> 'Footer'})]})";
const sources = {
 react: "import{createElement as h}from'react';import{createRoot}from'react-dom/client';import{"+shellImports+"}from'@vyrnforge/react/app-shell';import{"+navImports+"}from'@vyrnforge/react/side-nav';createRoot(document.querySelector('#root')).render("+reactTree+");",
 vue: "import{createApp,h}from'vue';import{"+shellImports+"}from'@vyrnforge/vue/app-shell';import{"+navImports+"}from'@vyrnforge/vue/side-nav';createApp({render:()=>"+vueTree+"}).mount('#root');",
 angular: "import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import*as Shell from'@vyrnforge/angular/app-shell';import*as Nav from'@vyrnforge/angular/side-nav';class App{};Component({selector:'qa-shell',standalone:true,imports:[...Object.values(Shell),...Object.values(Nav)],template:"+JSON.stringify(angularTemplate)+"})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});",
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
try {
 for(const port of ports) {
  const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'light',reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  try {
   await page.goto('http://127.0.0.1:'+server.address().port+'/'+port+'.html');
   const main=page.getByRole('main'), nav=page.getByRole('navigation',{name:'Primary'}), home=page.getByRole('link',{name:'Home',exact:true}), projects=page.getByRole('link',{name:'Projects',exact:true});
   await main.waitFor(); await nav.waitFor(); await home.waitFor();
   assert.equal(await main.count(),1); assert.equal(await nav.count(),1);
   assert.equal(await page.getByRole('banner').count(),1); assert.equal(await page.getByRole('contentinfo').count(),1);
   assert.equal(await home.getAttribute('aria-current'),'page'); assert.equal(await projects.getAttribute('aria-current'),null);
   assert.equal(await home.getAttribute('href'),'#home'); assert.equal(await projects.getAttribute('href'),'#projects');
   for(const hook of ['app-shell','app-shell-header','app-shell-body','app-shell-navigation','app-shell-main','app-shell-footer','side-nav','side-nav-group','side-nav-group-label','side-nav-list','side-nav-item','side-nav-link']) assert.ok(await page.locator('[data-vf-'+hook+']').count(),hook);
   const styles=await page.evaluate(()=>{const current=document.querySelector('[data-vf-side-nav-link][aria-current="page"]');const other=document.querySelector('[data-vf-side-nav-link]:not([aria-current])');const c=getComputedStyle(current),o=getComputedStyle(other);return{currentBackground:c.backgroundColor,otherBackground:o.backgroundColor,currentWeight:c.fontWeight,otherWeight:o.fontWeight,currentBorder:c.borderInlineStartWidth,shellDisplay:getComputedStyle(document.querySelector('[data-vf-app-shell]')).display};});
   assert.equal(styles.shellDisplay,'grid'); assert.notEqual(styles.currentBackground,styles.otherBackground); assert.ok(Number(styles.currentWeight)>Number(styles.otherWeight)); assert.equal(styles.currentBorder,'3px');
   await page.evaluate(()=>document.fonts.ready); const png=await page.screenshot({path:path.join(out,port+'.png'),animations:'disabled'}); const visualSha=createHash('sha256').update(png).digest('hex');
   await page.keyboard.press('Tab'); assert.equal(await home.evaluate(el=>document.activeElement===el),true); assert.notEqual(await home.evaluate(el=>getComputedStyle(el).outlineStyle),'none');
   await page.keyboard.press('Tab'); assert.equal(await projects.evaluate(el=>document.activeElement===el),true);
   const axe=(await new AxeBuilder({page}).analyze()).violations.map(v=>v.id); assert.deepEqual(axe,[]);
   await page.evaluate(()=>{document.documentElement.dir='rtl';}); assert.equal(await home.evaluate(el=>getComputedStyle(el).borderRightWidth),'3px');
   await page.setViewportSize({width:640,height:800}); const mobile=await page.locator('[data-vf-app-shell-navigation]').evaluate(el=>({inlineEnd:getComputedStyle(el).borderInlineEndWidth,blockEnd:getComputedStyle(el).borderBlockEndWidth})); assert.deepEqual(mobile,{inlineEnd:'0px',blockEnd:'1px'});
   assert.deepEqual(errors,[]);
   results.push({port,status:'PASS',styles,mobile,axe,visualSha});
  }catch(error){results.push({port,status:'FAIL',error:String(error),errors});}
  finally{await context.close();}
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
await writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
