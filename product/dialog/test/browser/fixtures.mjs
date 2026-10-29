export const browserFixture = {
  component: 'dialog',
  title: 'Dialog fixture',
  heading: 'Dialog browser fixture',
  ports: {
    web: {
      body: `
      <dialog id="web-dialog" open data-vf-dialog-root data-vf-open aria-labelledby="web-dialog-title" aria-describedby="web-dialog-description">
        <h2 id="web-dialog-title" data-vf-dialog-title>Example dialog</h2>
        <p id="web-dialog-description" data-vf-dialog-description>Dialog description</p>
        <div data-vf-dialog-body>Body</div>
        <button type="button" data-vf-dialog-close>Close</button>
      </dialog>`,
    },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-dialog-test' },
    elements: { story: 'createElementsStory' },
  },
};

export async function createReactStory({ client }) {
  const React = await import('react');
  const {
    DialogRoot,
    DialogTitle,
    DialogDescription,
    DialogBody,
    DialogClose,
  } = await import('@vyrnforge/react/dialog');

  function App() {
    const [open, setOpen] = React.useState(false);
    const [parentOpen, setParentOpen] = React.useState(false);
    const [childOpen, setChildOpen] = React.useState(false);
    const initialRef = React.useRef(null);
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'button',
        { id: 'react-open', type: 'button', onClick: () => setOpen(true) },
        'Open dialog',
      ),
      React.createElement(
        DialogRoot,
        {
          id: 'react-dialog',
          open,
          onOpenChange: setOpen,
          backdropDismiss: true,
          descriptionId: 'react-dialog-description',
          initialFocusRef: initialRef,
          onDismissRequest: client
            ? (request) => { document.body.dataset.dismissReason = request.reason; }
            : () => undefined,
        },
        React.createElement(DialogTitle, null, 'Edit profile'),
        React.createElement(DialogDescription, { id: 'react-dialog-description' }, 'Update your profile.'),
        React.createElement(
          DialogBody,
          null,
          React.createElement('input', { id: 'react-initial', ref: initialRef, 'aria-label': 'Profile name' }),
        ),
        React.createElement(DialogClose, { id: 'react-close' }, 'Close'),
      ),
      React.createElement(
        'button',
        { id: 'react-parent-open', type: 'button', onClick: () => setParentOpen(true) },
        'Open parent dialog',
      ),
      React.createElement(
        DialogRoot,
        { id: 'react-parent-dialog', open: parentOpen, onOpenChange: setParentOpen },
        React.createElement(DialogTitle, null, 'Parent dialog'),
        React.createElement(
          DialogBody,
          null,
          React.createElement(
            'button',
            { id: 'react-child-open', type: 'button', onClick: () => setChildOpen(true) },
            'Open child dialog',
          ),
          React.createElement(
            DialogRoot,
            { id: 'react-child-dialog', open: childOpen, onOpenChange: setChildOpen },
            React.createElement(DialogTitle, null, 'Child dialog'),
            React.createElement(DialogBody, null, 'Child content'),
          ),
        ),
      ),
    );
  }

  return React.createElement(App);
}

export async function createVueStory({ client }) {
  const { createSSRApp, h, ref } = await import('vue');
  const {
    DialogRoot,
    DialogTitle,
    DialogDescription,
    DialogBody,
    DialogClose,
  } = await import('@vyrnforge/vue/dialog');

  return createSSRApp({
    setup() {
      const open = ref(false);
      const parentOpen = ref(false);
      const childOpen = ref(false);
      return () => h('div', [
        h('button', { id: 'vue-open', type: 'button', onClick: () => { open.value = true; } }, 'Open dialog'),
        h(
          DialogRoot,
          {
            id: 'vue-dialog',
            modelValue: open.value,
            'onUpdate:modelValue': (value) => { open.value = value; },
            backdropDismiss: true,
            descriptionId: 'vue-dialog-description',
            initialFocus: () => (client ? document.querySelector('#vue-initial') : null),
            onDismissRequest: client
              ? (request) => { document.body.dataset.dismissReason = request.reason; }
              : () => undefined,
          },
          () => [
            h(DialogTitle, {}, () => 'Edit profile'),
            h(DialogDescription, { id: 'vue-dialog-description' }, () => 'Update your profile.'),
            h(DialogBody, {}, () => h('input', { id: 'vue-initial', 'aria-label': 'Profile name' })),
            h(DialogClose, { id: 'vue-close' }, () => 'Close'),
          ],
        ),
        h(
          'button',
          { id: 'vue-parent-open', type: 'button', onClick: () => { parentOpen.value = true; } },
          'Open parent dialog',
        ),
        h(
          DialogRoot,
          {
            id: 'vue-parent-dialog',
            modelValue: parentOpen.value,
            'onUpdate:modelValue': (value) => { parentOpen.value = value; },
          },
          () => [
            h(DialogTitle, {}, () => 'Parent dialog'),
            h(DialogBody, {}, () => [
              h(
                'button',
                { id: 'vue-child-open', type: 'button', onClick: () => { childOpen.value = true; } },
                'Open child dialog',
              ),
              h(
                DialogRoot,
                {
                  id: 'vue-child-dialog',
                  modelValue: childOpen.value,
                  'onUpdate:modelValue': (value) => { childOpen.value = value; },
                },
                () => [
                  h(DialogTitle, {}, () => 'Child dialog'),
                  h(DialogBody, {}, () => 'Child content'),
                ],
              ),
            ]),
          ],
        ),
      ]);
    },
  });
}

export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component, signal } = await import('@angular/core');
  const {
    VfDialogRootDirective,
    VfDialogTitleDirective,
    VfDialogDescriptionDirective,
    VfDialogBodyDirective,
    VfDialogCloseDirective,
  } = await import('@vyrnforge/angular/dialog');

  const template = '<button id="angular-open" type="button" (click)="open.set(true)">Open dialog</button><dialog vfDialogRoot id="angular-dialog" [open]="open()" (openChange)="open.set($event)" (dismissRequest)="dismissed($event)" backdropDismiss descriptionId="angular-dialog-description"><h2 vfDialogTitle>Edit profile</h2><p vfDialogDescription id="angular-dialog-description">Update your profile.</p><div vfDialogBody><input id="angular-initial" aria-label="Profile name"></div><button id="angular-close" vfDialogClose>Close</button></dialog><button id="angular-parent-open" type="button" (click)="parentOpen.set(true)">Open parent dialog</button><dialog vfDialogRoot id="angular-parent-dialog" [open]="parentOpen()" (openChange)="parentOpen.set($event)"><h2 vfDialogTitle>Parent dialog</h2><div vfDialogBody><button id="angular-child-open" type="button" (click)="childOpen.set(true)">Open child dialog</button><dialog vfDialogRoot id="angular-child-dialog" [open]="childOpen()" (openChange)="childOpen.set($event)"><h2 vfDialogTitle>Child dialog</h2><div vfDialogBody>Child content</div></dialog></div></dialog>';

  class DialogTestApp {
    open = signal(false);
    parentOpen = signal(false);
    childOpen = signal(false);

    dismissed(request) {
      if (client) document.body.dataset.dismissReason = request.reason;
    }
  }

  Component({
    selector: 'vf-dialog-test',
    standalone: true,
    imports: [
      VfDialogRootDirective,
      VfDialogTitleDirective,
      VfDialogDescriptionDirective,
      VfDialogBodyDirective,
      VfDialogCloseDirective,
    ],
    template,
  })(DialogTestApp);

  return DialogTestApp;
}

export async function createElementsStory({ client }) {
  const body = `
    <button id="elements-open" type="button">Open dialog</button>
    <vf-dialog id="elements-root" backdrop-dismiss>
      <dialog id="elements-dialog">
        <h2 data-vf-dialog-title>Edit profile</h2>
        <p data-vf-dialog-description>Update your profile.</p>
        <div data-vf-dialog-body><input id="elements-initial" aria-label="Profile name"></div>
        <button id="elements-close" type="button" data-vf-dialog-close>Close</button>
      </dialog>
    </vf-dialog>
    <button id="elements-parent-open" type="button">Open parent dialog</button>
    <vf-dialog id="elements-parent-root">
      <dialog id="elements-parent-dialog">
        <h2 data-vf-dialog-title>Parent dialog</h2>
        <div data-vf-dialog-body>
          <button id="elements-child-open" type="button">Open child dialog</button>
          <vf-dialog id="elements-child-root">
            <dialog id="elements-child-dialog">
              <h2 data-vf-dialog-title>Child dialog</h2>
              <div data-vf-dialog-body>Child content</div>
            </dialog>
          </vf-dialog>
        </div>
      </dialog>
    </vf-dialog>`;

  return {
    body,
    activate: client
      ? async () => {
          const { defineDialogElement } = await import('@vyrnforge/elements/dialog');
          defineDialogElement();
          const root = document.querySelector('#elements-root');
          const parent = document.querySelector('#elements-parent-root');
          const child = document.querySelector('#elements-child-root');
          const wire = (trigger, target) => trigger.addEventListener('click', () => {
            target.open = true;
            queueMicrotask(() => target.querySelector('input,button,[tabindex]')?.focus());
          });
          wire(document.querySelector('#elements-open'), root);
          wire(document.querySelector('#elements-parent-open'), parent);
          wire(document.querySelector('#elements-child-open'), child);
          for (const element of [root, parent, child]) {
            element.addEventListener('vf-dismiss-request', (event) => {
              document.body.dataset.dismissReason = event.detail.reason;
            });
          }
        }
      : undefined,
  };
}
