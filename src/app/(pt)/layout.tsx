import type { ReactNode } from "react";
import { Root } from "@/components/Root";

export default function Layout({ children }: { children: ReactNode }) {
  return <Root lang="pt-BR">{children}</Root>;
}
