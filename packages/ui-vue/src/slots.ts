import { cloneVNode, Fragment, h } from "vue";
import type { Slots, VNode } from "vue";

function assignNamedSlot(name: string, nodes: readonly VNode[]): VNode[] {
  const assigned: VNode[] = [];
  for (const node of nodes) {
    if (node.type === Fragment && Array.isArray(node.children)) {
      assigned.push(...assignNamedSlot(name, node.children as VNode[]));
      continue;
    }
    if (typeof node.type === "symbol") {
      assigned.push(h("span", { slot: name }, [node]));
      continue;
    }
    assigned.push(cloneVNode(node, { slot: name }));
  }
  return assigned;
}

export function renderVyrnForgeSlots(slots: Slots): VNode[] {
  const children: VNode[] = [];
  if (slots.default) children.push(...slots.default());
  for (const [name, slot] of Object.entries(slots)) {
    if (name === "default" || !slot) continue;
    children.push(...assignNamedSlot(name, slot()));
  }
  return children;
}
