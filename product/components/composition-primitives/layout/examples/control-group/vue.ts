import { defineComponent, h } from 'vue';
import { Button } from '@vyrnforge/vue/button';
import { ControlGroup } from '@vyrnforge/vue/layout';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';

export const AlignmentActions = defineComponent({
  setup() {
    return () =>
      h(ControlGroup, { role: 'group', 'aria-label': 'Text alignment' }, () => [
        h(Button, { type: 'button', variant: 'secondary' }, () => 'Left'),
        h(Button, { type: 'button', variant: 'secondary' }, () => 'Center'),
        h(Button, { type: 'button', variant: 'secondary' }, () => 'Right'),
      ]);
  },
});
