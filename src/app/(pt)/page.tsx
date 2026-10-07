import { pt } from "@/content/pt";
import { HomePage, homeMetadata } from "@/components/Pages";

export const metadata = homeMetadata(pt);

export default function Page() {
  return <HomePage d={pt} />;
}
