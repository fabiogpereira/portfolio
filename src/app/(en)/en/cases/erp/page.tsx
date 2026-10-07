import { en } from "@/content/en";
import { ErpCasePage, caseMetadata } from "@/components/Pages";

export const metadata = caseMetadata(en, "erp");

export default function Page() {
  return <ErpCasePage d={en} />;
}
