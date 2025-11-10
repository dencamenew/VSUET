import { useQuery } from "@tanstack/react-query";
import { useFetch } from "./useFetch";
import { useToken } from "../useAuth";
import { ILessonSlot } from "./useTimetable";

export type TRoles = "teacher" | "student" | "admin" | undefined;

export interface IUser {
    details: {};
    first_name: string;
    last_name: string;
    max_id: string;
    role: TRoles;
    id: number;

    // student
    group_name?: string;
    zach_number?: string;

    // teacher
    groups_sbj?: {
        [key: string]: {
            lesson_type: ILessonSlot["class_type"],
            lesson_name: string
        }[]
    }
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
            });

            return await response.json();
        },
    });

    return data;
};