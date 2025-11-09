"use client"

import { useLogin } from "@/hooks/api/useLogin"
import { Loading } from "../ui/loading";
import { useLayoutEffect } from "react";
import { useToken } from "@/hooks/useAuth";

const MAX_ID = process.env.NEXT_PUBLIC_TARGET_MAX_ID || "1";

export default function AuthModule() {
  const auth = useLogin(MAX_ID);
  const { setToken } = useToken();

  useLayoutEffect(() => {
    const localToken = localStorage.getItem("token");

    if (localToken) {
      setToken(localToken);
    } else {
      auth.mutate();
    }
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <div className="size-16">
        <Loading />
      </div>
    </div>
  );
}
