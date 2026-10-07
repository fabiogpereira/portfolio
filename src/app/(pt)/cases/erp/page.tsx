import { pt } from "@/content/pt";
import { ErpCasePage, caseMetadata } from "@/components/Pages";

export const metadata = caseMetadata(pt, "erp");

export default function Page() {
  return <ErpCasePage d={pt} />;
}
