import type { ReactNode } from "react";
import { Section } from "@dravyn/ui-components";

export type DemoSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function DemoSection({ title, description, children }: DemoSectionProps) {
  return (
    <Section
      className="dv-playground-demo-section"
      description={description}
      title={title}
    >
      {children}
    </Section>
  );
}
