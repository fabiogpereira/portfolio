import { en } from "@/content/en";
import { CdpCasePage, caseMetadata } from "@/components/Pages";

export const metadata = caseMetadata(en, "dados");

export default function Page() {
  return <CdpCasePage d={en} />;
}
