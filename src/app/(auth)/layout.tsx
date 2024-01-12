import Image from "next/image";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import LogoDiv from "@/components/logo-div";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen flex-col">
      <nav className="flex justify-between p-3">
        <LogoDiv />
        <ModeToggle />
      </nav>
      <main className="flex-grow">
        <div className="flex h-full items-center justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}
