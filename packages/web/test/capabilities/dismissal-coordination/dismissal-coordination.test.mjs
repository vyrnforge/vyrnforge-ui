import test from 'node:test';
import assert from 'node:assert/strict';
import { createDismissalCoordinator } from '../../../dist/capabilities/dismissal-coordination/index.js';

class FakeKeyboardEvent { constructor(key, path = []) { this.key = key; this.path = path; } composedPath() { return this.path; } }
class FakeEvent { constructor(path = []) { this.path = path; } composedPath() { return this.path; } }
function fakeDocument() {
  const listeners = new Map();
  return {
    defaultView: { KeyboardEvent: FakeKeyboardEvent },
    addEventListener(type, listener) { const set = listeners.get(type) ?? new Set(); set.add(listener); listeners.set(type, set); },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
    emit(type, event) { for (const listener of listeners.get(type) ?? []) listener(event); },
    count(type) { return listeners.get(type)?.size ?? 0; },
  };
}

test('dismissal coordination targets only the top enabled layer and cleans up listeners', () => {
  const doc = fakeDocument();
  const root = {};
  const nested = {};
  const events = [];
  const coordinator = createDismissalCoordinator(doc);
  const unregisterRoot = coordinator.register({ element: root, onDismiss: (reason) => events.push(`root:${reason}`) });
  const unregisterNested = coordinator.register({ element: nested, onDismiss: (reason) => events.push(`nested:${reason}`) });
  doc.emit('keydown', new FakeKeyboardEvent('Escape'));
  assert.deepEqual(events, ['nested:escape']);
  doc.emit('pointerdown', new FakeEvent([nested]));
  assert.deepEqual(events, ['nested:escape']);
  doc.emit('pointerdown', new FakeEvent([]));
  assert.deepEqual(events, ['nested:escape', 'nested:outside-pointer']);
  unregisterNested();
  doc.emit('keydown', new FakeKeyboardEvent('Escape'));
  assert.deepEqual(events.at(-1), 'root:escape');
  unregisterRoot();
  assert.equal(doc.count('keydown'), 0);
  coordinator.destroy();
});
