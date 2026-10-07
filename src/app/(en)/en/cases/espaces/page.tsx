import { en } from "@/content/en";
import { EspacesCasePage, caseMetadata } from "@/components/Pages";

export const metadata = caseMetadata(en, "espaces");

export default function Page() {
  return <EspacesCasePage d={en} />;
}
