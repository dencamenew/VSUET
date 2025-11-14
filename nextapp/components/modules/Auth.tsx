"use client"

import { useLogin } from "@/hooks/api/useLogin"
import { Loading } from "../ui/loading";
import { Suspense, useLayoutEffect } from "react";
import { useMaxWebApp } from "@/hooks/api/useMaxWeb";

// const TARGET_MAX_ID = process.env.NEXT_PUBLIC_TARGET_MAX_ID || "1";

function AuthContent() {
  const { parsedRawData } = useMaxWebApp();
  const auth = useLogin();

  useLayoutEffect(() => {
    if (!parsedRawData || !parsedRawData.user || !parsedRawData.user.id) return;
    auth.mutate(parsedRawData.user.id.toString());
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
