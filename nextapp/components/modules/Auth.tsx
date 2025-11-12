"use client"

import { useLogin } from "@/hooks/api/useLogin"
import { Loading } from "../ui/loading";
import { Suspense, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";

const TARGET_MAX_ID = process.env.NEXT_PUBLIC_TARGET_MAX_ID || "1";

function AuthContent() {
  const searchParams = useSearchParams();
  const customMaxId = searchParams.get('custom_max_id')
  const auth = useLogin(customMaxId || TARGET_MAX_ID);

  useLayoutEffect(() => {
    auth.mutate();
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <div className="size-16">
        <Loading />
      </div>
    </div>
  );
}

export default function AuthModule() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center flex-col">
        <div className="size-16">
          <Loading />
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
