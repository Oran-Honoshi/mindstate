import { generateGameMetadata } from "@/lib/seo/gameMetadata";

export const metadata = generateGameMetadata("pinpoint");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}