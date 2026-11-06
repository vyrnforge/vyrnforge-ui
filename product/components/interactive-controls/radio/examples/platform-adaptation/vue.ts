import { createApp, defineComponent, h, ref } from 'vue';
import { Button } from '@vyrnforge/vue/button';
import { Radio } from '@vyrnforge/vue/radio';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/radio.css';

const App = defineComponent({
  setup() {
    const selected = ref('standard');
    const confirmed = ref<string | null>(null);
    return () => h('form', {
      onSubmit: (event: Event) => { event.preventDefault(); confirmed.value = selected.value; }
    }, [
      h('fieldset', [
        h('legend', 'Delivery speed'),
        h('label', [h(Radio, { name: 'deliverySpeed', value: 'standard', checked: selected.value === 'standard', onChange: () => { selected.value = 'standard'; } }), ' Standard']),
        h('label', [h(Radio, { name: 'deliverySpeed', value: 'express', checked: selected.value === 'express', onChange: () => { selected.value = 'express'; } }), ' Express']),
        h('label', [h(Radio, { name: 'deliverySpeed', value: 'same-day', disabled: true }), ' Same day — unavailable'])
      ]),
      h(Button, { type: 'submit' }, () => 'Confirm delivery speed'),
      h('p', { role: 'status' }, confirmed.value ? `Confirmed: ${confirmed.value}.` : 'Not confirmed.')
    ]);
  }
});

createApp(App).mount('#root');
