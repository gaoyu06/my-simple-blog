import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ColorThemeSwitcher } from "@/components/ui/color-theme-switcher";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grain relative min-h-dvh bg-gradient-soft">
      <div className="absolute right-6 top-6 z-10 flex items-center gap-1">
        <LanguageSwitcher />
        <ColorThemeSwitcher />
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
