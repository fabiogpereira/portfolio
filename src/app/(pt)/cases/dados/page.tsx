import { pt } from "@/content/pt";
import { CdpCasePage, caseMetadata } from "@/components/Pages";

export const metadata = caseMetadata(pt, "dados");

export default function Page() {
  return <CdpCasePage d={pt} />;
}
