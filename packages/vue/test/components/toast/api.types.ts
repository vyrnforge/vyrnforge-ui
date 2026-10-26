import { h } from 'vue';
import { ToastClose, ToastDescription, ToastRoot, ToastTitle, ToastViewport } from '@vyrnforge/vue/toast';

h(ToastRoot, {
  open: true,
  defaultOpen: true,
  duration: 5000,
  'onUpdate:open': (open: boolean) => { void open; },
  onOpenChange: (open: boolean) => { void open; },
});
void ToastViewport;
void ToastTitle;
void ToastDescription;
void ToastClose;
