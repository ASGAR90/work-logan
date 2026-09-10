import { Clock, PieChart, UserRound } from "lucide-react";

export const navItems = [
  { href: "/", labelKey: "nav.worklog", icon: Clock },
  { href: "/summary", labelKey: "nav.summary", icon: PieChart },
  { href: "/profile", labelKey: "nav.profile", icon: UserRound }
] as const;
