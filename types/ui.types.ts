import type { ReactNode } from "react";

export type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export type SectionWrapperProps = {
  id?: string;
  heading?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export type NavItem = {
  label: string;
  href: string;
};
