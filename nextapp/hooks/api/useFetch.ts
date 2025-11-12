import { useCallback } from "react";
import { useToken } from "../useAuth";

export function useAPIws() {
    // return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws/api';
    return 'ws://localhost:8080/ws/api';
}

export function useAPI() {
    // return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';
    return 'http://localhost:8080/api';
};

export function useFetch() {
    const { token, setToken } = useToken();
    const api = useAPI();

    return useCallback(async (url: string, init?: RequestInit) => {
        const headers = new Headers(init?.headers || {});
        headers.set('bypass-tunnel-reminder', 'true');

        if (token)
            headers.set("Authorization", `Bearer ${token}`);

        if (!headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }

        const fetchInit: RequestInit = {
            ...init,
            headers,
        };

        try {
            const response = await fetch(`${api}${url}`, fetchInit);

            if (response.status === 401) {
                setToken(undefined);
                localStorage.removeItem("token");
                throw new Error("Ошибка авторизации!");
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error(errorData);
            }

            return response;
        } catch (error) {
            throw error;
        }
    }, [token, api]);
}