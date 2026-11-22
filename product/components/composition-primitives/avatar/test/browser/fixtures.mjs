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
        `<span id="square-avatar" data-vf-avatar data-vf-avatar-size="lg" data-vf-avatar-shape="square" role="img" aria-label="Ada Lovelace"><span data-vf-avatar-initials aria-hidden="true">AL</span></span>`,
        `<span id="icon-avatar" data-vf-avatar data-vf-avatar-size="lg" data-vf-avatar-appearance="icon" role="img" aria-label="Anonymous member"><span data-vf-avatar-icon aria-hidden="true"><svg data-vf-icon focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-5 4-8 8-8s8 3 8 8"></path></svg></span></span>`,
        `<span id="icon-fallback" data-vf-avatar data-vf-avatar-appearance="icon" role="img" aria-label="Alex Chen"><span data-vf-avatar-icon aria-hidden="true"><svg data-vf-icon focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-5 4-8 8-8s8 3 8 8"></path></svg></span></span>`,
        `<ul id="limited-group" role="list" data-vf-avatar-group data-vf-avatar-group-spacing="overlap" aria-label="Review team">
          <li data-vf-avatar-group-item><span data-vf-avatar data-vf-avatar-size="lg" data-vf-avatar-shape="square" role="img" aria-label="Ada Lovelace"><span data-vf-avatar-initials aria-hidden="true">AL</span></span></li>
          <li data-vf-avatar-group-item><span data-vf-avatar data-vf-avatar-size="sm" data-vf-avatar-shape="square" role="img" aria-label="Alex Chen"><span data-vf-avatar-initials aria-hidden="true">AC</span></span></li>
          <li data-vf-avatar-group-item><span data-vf-avatar data-vf-avatar-size="lg" data-vf-avatar-shape="square" data-vf-avatar-overflow role="img" aria-label="5 more reviewers"><span data-vf-avatar-initials aria-hidden="true">+5</span></span></li>
        </ul>`,
        ...['overlap', 'none', 'md'].map((spacing) => `<ul id="spacing-${spacing}" role="list" data-vf-avatar-group data-vf-avatar-group-spacing="${spacing}" aria-label="Contributors ${spacing}">
          <li data-vf-avatar-group-item><span data-vf-avatar role="img" aria-label="Ada Lovelace"><span data-vf-avatar-initials aria-hidden="true">AL</span></span></li>
          <li data-vf-avatar-group-item><span data-vf-avatar role="img" aria-label="Alex Chen"><span data-vf-avatar-initials aria-hidden="true">AC</span></span></li>
        </ul>`),
        '</div>',
      ].join('\n'),
    },
    react: { story: 'avatarReactStory' },
  },
};

export async function avatarReactStory({ client = false } = {}) {
  const { createElement: h, useState } = await import('react');
  const { Avatar, AvatarGroup } = await import('@vyrnforge/react/avatar');
  const { Icon } = await import('@vyrnforge/react/icon');
  const { userIcon } = await import('@vyrnforge/icons/user');
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

  function DynamicGroup() {
    const [limit, setLimit] = useState(2);
    return h('section', { 'aria-label': 'Dynamic Avatar group' },
      h(AvatarGroup, { id: 'dynamic-group', label: 'Dynamic reviewers', total: 7,
        limit, size: 'md', spacing: 'overlap',
        formatOverflow: (count) => count + ' more reviewers',
      },
      h(Avatar, { name: 'Ada Lovelace' }),
      h(Avatar, { name: 'Alex Chen' }),
      h(Avatar, { name: 'Maria García', initials: 'MG' }),
      h(Avatar, { name: 'Grace Hopper' })),
      h('button', { id: 'increase-group-limit', type: 'button',
        onClick: () => setLimit(3) }, 'Show another member'));
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
    h(SourceChange),
    h(Avatar, { id: 'square-avatar', name: 'Ada Lovelace', shape: 'square', size: 'lg' }),
    h(Avatar, { id: 'icon-avatar', name: 'Anonymous member', appearance: 'icon',
      icon: h(Icon, { icon: userIcon }), size: 'lg' }),
    h(Avatar, { id: 'icon-fallback', name: 'Alex Chen',
      src: '/__vyrnforge_missing_avatar_for_icon.webp', fallback: 'icon',
      icon: h(Icon, { icon: userIcon }) }),
    h(AvatarGroup, { id: 'limited-group', label: 'Review team',
      total: 7, limit: 2, size: 'lg', shape: 'square',
      formatOverflow: (count) => count + ' more reviewers',
      ref: client ? (node) => { if (node) document.body.dataset.avatarGroupRefAttached =
        String(node instanceof HTMLUListElement); } : undefined,
    },
    h(Avatar, { name: 'Ada Lovelace' }),
    h(Avatar, { name: 'Alex Chen', size: 'sm' }),
    h(Avatar, { name: 'Maria García' })),
    ...['overlap', 'none', 'md'].map((spacing) =>
      h(AvatarGroup, { id: 'spacing-' + spacing, key: spacing,
        label: 'Contributors ' + spacing, spacing },
        h(Avatar, { name: 'Ada Lovelace' }),
        h(Avatar, { name: 'Alex Chen' }))),
    h(DynamicGroup));
}
