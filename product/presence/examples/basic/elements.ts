import { definePresenceElement } from '@vyrnforge/elements/presence';
definePresenceElement();
const root=document.querySelector('#root')!; root.innerHTML='<button id="close">Close</button><vf-presence id="panel" present>Panel <button id="complete">Complete exit</button></vf-presence>'; root.querySelector('#close')!.addEventListener('click',()=>root.querySelector('#panel')!.removeAttribute('present')); root.querySelector('#complete')!.addEventListener('click',()=>root.querySelector('vf-presence')!.completeExit());
