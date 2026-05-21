import { generateGameMetadata } from "@/lib/seo/gameMetadata";

export const metadata = generateGameMetadata("logic-path");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}