import { generateGameMetadata } from "@/lib/seo/gameMetadata";

export const metadata = generateGameMetadata("memory");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}