import { defineComponent, h } from 'vue';

export const FileInput = defineComponent({
  name: 'VfFileInput',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => h('input', { ...attrs, type: 'file', 'data-vf-file-input': '' });
  },
});
