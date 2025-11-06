import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export function AuthGuard(
    {
        children
    }: {
        children: React.ReactNode
    }
) {
    const { isAuth } = useAuth();
    return isAuth ? children : null;
};