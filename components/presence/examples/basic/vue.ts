import { createApp, h, ref } from 'vue';
import { usePresence } from '@vyrnforge/vue/presence';
createApp({ setup(){ const present=ref(true); const p=usePresence(present); return()=>h('div',[h('button',{onClick:()=>present.value=false},'Close'),p.mounted.value&&h('div',{'data-state':p.state.value},['Panel ',p.state.value==='exiting'?h('button',{onClick:p.completeExit},'Complete exit'):null])]); } }).mount('#root');
