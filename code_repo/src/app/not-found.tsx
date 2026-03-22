import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-parchment flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-8">
        <Logo href="/" variant="dark" size="md" />
      </div>
      <p className="font-outfit text-[8rem] leading-none font-bold text-navy/10 select-none">404</p>
      <h1 className="font-outfit text-3xl font-bold text-navy mt-2 mb-3">Page not found</h1>
      <p className="text-muted-foreground max-w-sm mb-8">
        This page doesn&apos;t exist or may have been moved. Head back and keep going.
      </p>
      <Link
        href="/"
        className="inline-block rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy/90 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
