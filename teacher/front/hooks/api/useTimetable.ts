import { useQuery } from "@tanstack/react-query";
import { useFetch } from "./useFetch";
import { useToken } from "../useAuth";

interface ITimetable {}

export function useTimetable() {
    const fetch = useFetch();
    const { token } = useToken();

    const { data } = useQuery({
        queryKey: ["users/me", token],
        enabled: !!token,
        queryFn: async (): Promise<ITimetable> => {
            const response = await fetch("/my/timetable", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            return await response.json();
        },
    });

    return data;
};