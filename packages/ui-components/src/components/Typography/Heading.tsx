import type { HeadingProps } from "./Typography.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function Heading({
  className,
  level = 2,
  size = "md",
  ...props
}: HeadingProps) {
  const Component = `h${level}` as const;

  return (
    <Component
      className={joinClassNames("dv-heading", `dv-heading--${size}`, className)}
      {...props}
    />
  );
}
