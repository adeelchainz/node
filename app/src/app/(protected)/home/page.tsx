"use client";
import { useSession } from "@/hooks/useSession";

export default function Home() {
  const { data: session } = useSession();
  console.log(session);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">Welcome!</div>
    </div>
  );
}
