import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  /** "dark" = default, "light" = inverted for dark backgrounds */
  variant?: "dark" | "light";
  size?: "xs" | "sm" | "md" | "lg";
}

export function Logo({ href = "/", className, variant = "dark", size = "md" }: LogoProps) {
  const sizes = { xs: 48, sm: 80, md: 110, lg: 160 };
  const w = sizes[size];
  const h = Math.round(w * 0.35);

  const mark = (
    <span className={cn("flex items-center select-none", className)}>
      <Image
        src="/logo.png"
        alt="Mentality Sports"
        width={w}
        height={h}
        className={cn("object-contain", variant === "light" && "brightness-0 invert")}
        priority
      />
    </span>
  );

  if (!href) return mark;
  return <Link href={href}>{mark}</Link>;
}
