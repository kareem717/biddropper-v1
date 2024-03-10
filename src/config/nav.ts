import { Icons } from "@/components/icons";
import { LucideIcon } from "lucide-react";

export interface SidebarLink {
  title: string;
  href: string;
  icon: LucideIcon;
}

type AdditionalLinks = {
  title: string;
  links: SidebarLink[];
};

export const defaultLinks: SidebarLink[] = [
  { href: "/dashboard", title: "Home", icon: Icons.homeIcon },
  { href: "/account", title: "Account", icon: Icons.globe },
  { href: "/settings", title: "Settings", icon: Icons.cog },
];

export const additionalLinks: AdditionalLinks[] = [];
