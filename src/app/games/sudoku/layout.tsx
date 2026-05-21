import { generateGameMetadata } from "@/lib/seo/gameMetadata";

export const metadata = generateGameMetadata("sudoku");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}