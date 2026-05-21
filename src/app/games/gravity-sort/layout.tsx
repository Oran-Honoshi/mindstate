import { generateGameMetadata } from "@/lib/seo/gameMetadata";

export const metadata = generateGameMetadata("gravity-sort");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}