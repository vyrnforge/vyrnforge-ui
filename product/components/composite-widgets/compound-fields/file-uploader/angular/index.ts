import { Directive, DestroyRef, ElementRef, afterNextRender, inject, output, signal } from '@angular/core';

function acceptDrop(input: HTMLInputElement, files: FileList): void {
  if (files.length === 0 || input.matches(':disabled')) return;
  if (input.multiple || files.length === 1) input.files = files;
  else {
    const transfer = new DataTransfer();
    const first = files.item(0);
    if (!first) return;
    transfer.items.add(first);
    input.files = transfer.files;
  }
  // A drop is a native file acquisition request, not an independent file store.
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
@Directive({ selector: '[vfFileUploaderRoot]', standalone: true, host: { 'data-vf-file-uploader-root': '' } })
export class VfFileUploaderRootDirective {
  readonly filesChange = output<File[]>();
  readonly files = signal<File[]>([]);
  readonly inputDisabled = signal(false);
  input: HTMLInputElement | null = null;
  add(v: FileList | File[]) {
    const next = Array.from(v);
    this.files.set(next);
    this.filesChange.emit(next);
  }
}
@Directive({
  selector: 'input[vfFileUploaderInput]',
  standalone: true,
  host: { type: 'file', 'data-vf-file-uploader-input': '', '(change)': 'change($event)' },
})
export class VfFileUploaderInputDirective {
  private el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);
  constructor(readonly root: VfFileUploaderRootDirective) {
    const element = this.el.nativeElement;
    root.input = element;
    this.destroyRef.onDestroy(() => { if (root.input === element) root.input = null; });
    afterNextRender(() => {
      const setDisabled = (disabled: boolean) => root.inputDisabled.set(disabled);
      const sync = () => setDisabled(element.matches(':disabled'));
      const observer = new MutationObserver(sync);
      observer.observe(element, { attributes: true, attributeFilter: ['disabled'] });
      for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (ancestor.tagName === 'FIELDSET') observer.observe(ancestor, { attributes: true, attributeFilter: ['disabled'] });
      }
      sync();
      const document = element.ownerDocument;
      let active = true;
      const onReset = (event: Event) => {
        if (!element.form || element.form !== event.target || !element.files?.length) return;
        setTimeout(() => {
          if (active && !event.defaultPrevented && element.form === event.target && !element.files?.length) root.add([]);
        }, 0);
      };
      document.addEventListener('reset', onReset, true);
      this.destroyRef.onDestroy(() => {
        active = false;
        observer.disconnect();
        document.removeEventListener('reset', onReset, true);
        setDisabled(false);
      });
    });
  }
  change(e: Event) {
    const element = e.currentTarget as HTMLInputElement;
    if (!element.matches(':disabled') && element.files) this.root.add(element.files);
  }
}
@Directive({
  selector: 'button[vfFileUploaderDropzone]',
  standalone: true,
  host: {
    type: 'button',
    'data-vf-file-uploader-dropzone': '',
    '[attr.aria-disabled]': 'root.inputDisabled() ? "true" : null',
    '(click)': 'activate($event)',
    '(dragover)': 'drag($event)',
    '(drop)': 'drop($event)',
  },
})
export class VfFileUploaderDropzoneDirective {
  constructor(readonly root: VfFileUploaderRootDirective) {}
  private blocked(button: HTMLButtonElement): boolean {
    return button.matches(':disabled') || button.getAttribute('aria-disabled') === 'true' || !this.root.input || this.root.input.matches(':disabled');
  }
  activate(e: MouseEvent) {
    if (!e.defaultPrevented && !this.blocked(e.currentTarget as HTMLButtonElement)) this.root.input?.click();
  }
  drag(e: DragEvent) {
    if (e.defaultPrevented || !e.dataTransfer?.types.includes('Files')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = this.blocked(e.currentTarget as HTMLButtonElement) ? 'none' : 'copy';
  }
  drop(e: DragEvent) {
    if (e.defaultPrevented) return;
    e.preventDefault();
    const input = this.root.input;
    if (input && e.dataTransfer && !this.blocked(e.currentTarget as HTMLButtonElement)) acceptDrop(input, e.dataTransfer.files);
  }
}
