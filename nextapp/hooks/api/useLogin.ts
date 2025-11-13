import { useMutation } from "@tanstack/react-query";
import { useToken } from "../useAuth";
import { useFetch } from "./useFetch";

export function useLogin() {
    const { setToken } = useToken();
    const fetch = useFetch();

    const handleAuth = useMutation({
        mutationFn: async (maxId: string | undefined | null,) => {
            const response = await fetch("/auth/login_max_id", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({
                    max_id: maxId,
                }),
            });

            return response.json();
        },
        onSuccess: (data: { access_token: string }) => {
            localStorage.setItem("token", data.access_token);
            setToken(data.access_token);
        },
    });

    return handleAuth;
};