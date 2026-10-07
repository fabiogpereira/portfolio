import { en } from "@/content/en";
import { NotasCasePage, caseMetadata } from "@/components/Pages";

export const metadata = caseMetadata(en, "notas");

export default function Page() {
  return <NotasCasePage d={en} />;
}
