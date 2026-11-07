import { createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { usePresence } from '@vyrnforge/react/presence';
function App(){ const [present,setPresent]=useState(true); const p=usePresence(present); return createElement('div',null,createElement('button',{onClick:()=>setPresent(false)},'Close'),p.mounted&&createElement('div',{'data-state':p.state},'Panel ',p.state==='exiting'&&createElement('button',{onClick:p.completeExit},'Complete exit'))); }
createRoot(document.querySelector('#root')!).render(createElement(App));
