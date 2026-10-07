import { pt } from "@/content/pt";
import { EspacesCasePage, caseMetadata } from "@/components/Pages";

export const metadata = caseMetadata(pt, "espaces");

export default function Page() {
  return <EspacesCasePage d={pt} />;
}
