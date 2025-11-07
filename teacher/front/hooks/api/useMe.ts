import { useQuery } from "@tanstack/react-query";
import { useFetch } from "./useFetch";
import { useToken } from "../useAuth";
import { useLayoutEffect } from "react";

export type TRoles = "teacher" | "student" | "admin" | undefined;

export interface IUser {
    details: {};
    first_name: string;
    last_name: string;
    max_id: string;
    role: TRoles;
    id: number;
};

export function useMe() {
    const fetch = useFetch();
    const { token } = useToken();

    const { data } = useQuery({
        queryKey: ["users/me", token],
        enabled: !!token,
        queryFn: async (): Promise<IUser> => {
            const response = await fetch("/user/me", {
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