import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { useT } from "../../lib/i18n/LocalizationProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useT();
  const nextIsDark = theme === "light";

  return (
    <button
      className="icon-button theme-toggle"
      type="button"
      onClick={toggle}
      // The label names what the control will do, not the state it is in --
      // "Dark theme" alone leaves a screen-reader user guessing.
      aria-label={nextIsDark ? t("theme.toDark") : t("theme.toLight")}
      title={nextIsDark ? t("theme.toDark") : t("theme.toLight")}
    >
      {nextIsDark ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
