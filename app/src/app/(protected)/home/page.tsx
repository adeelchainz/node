"use client";
import OnboardingFlow from "@/components/onboarding/onboarding";
import { useSession } from "@/hooks/useSession";

export default function Home() {
  const { data: session } = useSession();
  console.log(session);

  return (
    <>
      <OnboardingFlow />
    </>
  );
}
