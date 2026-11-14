import { defineComponent, h } from 'vue';
export const PaginationRoot = defineComponent({
  name: 'PaginationRoot',
  setup(_, { attrs, slots }) {
    return () => h('nav', { ...attrs, 'data-vf-pagination-root': '' }, slots.default?.());
  },
});
export const PaginationItem = defineComponent({
  name: 'PaginationItem',
  props: { current: Boolean },
  setup(p, { attrs, slots }) {
    return () =>
      h(
        'a',
        { ...attrs, 'aria-current': p.current ? 'page' : undefined, 'data-vf-pagination-item': '' },
        slots.default?.(),
      );
  },
});
export const PaginationPrevious = defineComponent({
  name: 'PaginationPrevious',
  setup(_, { attrs, slots }) {
    return () => h('a', { ...attrs, 'data-vf-pagination-previous': '' }, slots.default?.());
  },
});
export const PaginationNext = defineComponent({
  name: 'PaginationNext',
  setup(_, { attrs, slots }) {
    return () => h('a', { ...attrs, 'data-vf-pagination-next': '' }, slots.default?.());
  },
});
