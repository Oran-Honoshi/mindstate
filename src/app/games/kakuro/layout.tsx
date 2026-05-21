import { generateGameMetadata } from "@/lib/seo/gameMetadata";

export const metadata = generateGameMetadata("kakuro");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}