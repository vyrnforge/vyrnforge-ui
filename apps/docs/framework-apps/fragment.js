export function parseFragment(value) {
  const parsed = new DOMParser().parseFromString(`<body>${value || ''}</body>`, 'text/html');
  return Array.from(parsed.body.childNodes);
}
