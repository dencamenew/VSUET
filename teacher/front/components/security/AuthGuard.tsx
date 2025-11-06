'use client';

import { useAuth } from "@/hooks/useAuth";

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