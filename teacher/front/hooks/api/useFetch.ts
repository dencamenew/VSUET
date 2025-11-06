import { useCallback } from "react";
import { useToken } from "../useAuth";

export function useAPI() {
    // return "https://teacherbackend.cloudpub.ru/api";
    return 'http://localhost:8081/api';
};

export function useFetch() {
    const { token, setToken } = useToken();
    const api = useAPI();

    return useCallback(async (url: string, init?: RequestInit) => {
        const headers = new Headers(init?.headers || {});

        if (token)
            headers.set("X-Session-Id", token);

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