import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Toaster } from "@/components/toaster";

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <div className="absolute right-6 top-6 z-10 flex items-center gap-1">
        <ThemeToggle />
      </div>
      {children}
      <Toaster />
    </div>
  );
}
