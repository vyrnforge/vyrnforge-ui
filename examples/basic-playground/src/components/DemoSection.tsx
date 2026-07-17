import type { ReactNode } from "react";
import { Section } from "@vyrnforge/ui-components";

export type DemoSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function DemoSection({ title, description, children }: DemoSectionProps) {
  return (
    <Section
      className="vf-playground-demo-section"
      description={description}
      title={title}
    >
      {children}
    </Section>
  );
}
