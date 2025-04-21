"use client";
// import { useApiQuery } from "@/lib/reactQuery/hooks";
import { Verify } from "@/services/auth";
import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Spinner from "./ui/spinner";
export function Verification({}: React.ComponentPropsWithoutRef<"div">) {
  const params = useParams(); // { token: 'abc123' }
  const searchParams = useSearchParams();
  const { verify } = Verify();
  // const { data } = useApiQuery("http://localhost:3000/v1/self", {
  //   active: true,
  // });
  useEffect(() => {
    const token = (params.token as string) ?? "";
    const code = searchParams.get("code") ?? "";

    verify({ token, code });
  });

  return (
    <div className="flex justify-center content-center">
      <Spinner />
    </div>
  );
}
