"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Redirect the old /creator/portal to the new /creator/studio */
export default function CreatorPortalRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/creator/studio");
  }, [router]);
  return (
    <div className="min-h-screen bg-cream dark:bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-saffron border-t-transparent animate-spin" />
    </div>
  );
}
