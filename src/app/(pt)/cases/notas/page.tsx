import { pt } from "@/content/pt";
import { NotasCasePage, caseMetadata } from "@/components/Pages";

export const metadata = caseMetadata(pt, "notas");

export default function Page() {
  return <NotasCasePage d={pt} />;
}
