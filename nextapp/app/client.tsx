'use client';

import { useMaxWebApp } from "@/hooks/api/useMaxWeb";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";

export function Client({ children }: PropsWithChildren) {
    useMaxWebApp();
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
};