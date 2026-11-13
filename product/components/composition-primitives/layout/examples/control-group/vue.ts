import { defineComponent, h } from 'vue';
import { Button } from '@vyrnforge/vue/button';
import { Input } from '@vyrnforge/vue/input';
import { ControlGroup } from '@vyrnforge/vue/layout';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/input.css';
import '@vyrnforge/web/styles/layout.css';

export const SearchControls = defineComponent({
  setup() {
    return () =>
      h(ControlGroup, null, () => [
        h(Input, { type: 'search', 'aria-label': 'Search query' }),
        h(Button, { type: 'button', variant: 'secondary' }, () => 'Search'),
      ]);
  },
});
