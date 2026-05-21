import { generateGameMetadata } from "@/lib/seo/gameMetadata";

export const metadata = generateGameMetadata("2048-pro");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}