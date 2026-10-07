import { en } from "@/content/en";
import { HomePage, homeMetadata } from "@/components/Pages";

export const metadata = homeMetadata(en);

export default function Page() {
  return <HomePage d={en} />;
}
