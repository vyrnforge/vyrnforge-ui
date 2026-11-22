export const browserFixture = {
  component: 'avatar',
  title: 'Avatar fixture',
  heading: 'Avatar identity presentation',
  ports: {
    web: {
      body: [
        '<div><h1>Avatar identity presentation</h1>',
        '<span id="initials" data-vf-avatar data-vf-avatar-size="sm" role="img" aria-label="Ada Lovelace"><span data-vf-avatar-initials aria-hidden="true">AL</span></span>',
        '<span id="photo" data-vf-avatar data-vf-avatar-size="lg" role="img" aria-label="Alex Chen"><span data-vf-avatar-initials aria-hidden="true">AC</span><img data-vf-avatar-image alt="" loading="eager" decoding="async" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2796%27 height=%2796%27%3E%3Crect width=%2796%27 height=%2796%27 fill=%27%23b7d4e9%27/%3E%3Ccircle cx=%2748%27 cy=%2735%27 r=%2717%27 fill=%27%23c68f70%27/%3E%3Cpath d=%27M13 96c2-29 16-39 35-39s33 10 35 39Z%27 fill=%27%233d6889%27/%3E%3C/svg%3E"></span>',
        '<span id="native-fallback" data-vf-avatar data-vf-avatar-size="md" role="img" aria-label="Maria García"><span data-vf-avatar-initials aria-hidden="true">MG</span></span>',
        '<p id="decorative-line"><span id="decorative" data-vf-avatar data-vf-avatar-size="md" aria-hidden="true"><span data-vf-avatar-initials aria-hidden="true">AL</span></span> <span>Ada Lovelace</span></p>',
        '</div>',
      ].join('\n'),
    },
    react: { story: 'avatarReactStory' },
  },
};

export async function avatarReactStory({ client = false } = {}) {
  const { createElement: h, useState } = await import('react');
  const { Avatar } = await import('@vyrnforge/react/avatar');
  const photo = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2796%27 height=%2796%27%3E%3Crect width=%2796%27 height=%2796%27 fill=%27%23b7d4e9%27/%3E%3Ccircle cx=%2748%27 cy=%2735%27 r=%2717%27 fill=%27%23c68f70%27/%3E%3Cpath d=%27M13 96c2-29 16-39 35-39s33 10 35 39Z%27 fill=%27%233d6889%27/%3E%3C/svg%3E";

  function SourceChange() {
    const [src, setSrc] = useState(photo);
    return h('section', { 'aria-label': 'Avatar source changes' },
      h(Avatar, { id: 'source-change', name: 'Alex Chen', src, initials: 'AC' }),
      h('button', { id: 'break-source', type: 'button',
        onClick: () => setSrc('/__vyrnforge_missing_avatar.webp') }, 'Break image'),
      h('button', { id: 'restore-source', type: 'button',
        onClick: () => setSrc(photo) }, 'Restore image'));
  }

  return h('div', null,
    h('h1', null, 'Avatar identity presentation'),
    h(Avatar, {
      id: 'initials', name: 'Ada Lovelace', size: 'sm',
      ref: client ? (node) => { if (node) document.body.dataset.avatarRefAttached =
        String(node instanceof HTMLSpanElement); } : undefined,
    }),
    h(Avatar, {
      id: 'photo', name: 'Alex Chen', src: photo, initials: 'AC', size: 'lg',
      loading: 'eager', decoding: 'async',
    }),
    h(Avatar, { id: 'native-fallback', name: 'Maria García', initials: 'MG' }),
    h('p', { id: 'decorative-line' },
      h(Avatar, { id: 'decorative', name: 'Ada Lovelace', decorative: true }),
      h('span', null, 'Ada Lovelace')),
    h(SourceChange));
}
