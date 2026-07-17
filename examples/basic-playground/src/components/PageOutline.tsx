import { useActiveSection } from "./useActiveSection";

export type PageOutlineItem = {
  id: string;
  label: string;
};

export type PageOutlineProps = {
  items: PageOutlineItem[];
  title?: string;
};

export function PageOutline({ items, title = "On this page" }: PageOutlineProps) {
  const activeId = useActiveSection(items.map((item) => item.id));

  return (
    <nav aria-label="On this page" className="vf-playground-page-outline">
      <p className="vf-playground-page-outline__title">{title}</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a aria-current={activeId === item.id ? "location" : undefined} href={`#${item.id}`}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
