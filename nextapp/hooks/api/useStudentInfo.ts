import { useQuery } from "@tanstack/react-query";
import { useToken } from "../useAuth";
import { useFetch } from "./useFetch";

interface IStudentInfo {
    first_name: string,
    last_name: string,
}

export function useStudentInfo(zach_number: string | undefined) {
    const fetch = useFetch();
    const { token } = useToken();

    const { data } = useQuery<IStudentInfo>({
        queryKey: ['student/info', zach_number],
        enabled: !!token && !!zach_number,
        queryFn: async () => {
            const response = await fetch(`/student_info/zach_info?zach=${zach_number}`);

            return response.json();
        },
    })

    return data;
}

export interface IStudentSubject {
    subject_name: string;
    subject_type: string;
}

export interface IStudentInfoSubject {
    [key: string]: IStudentSubject[];
}

export function useStudentInfoSubjects(zach_number: string | undefined) {
    const fetch = useFetch();
    const { token } = useToken();

    const { data } = useQuery<IStudentInfoSubject>({
        queryKey: ['student/info/subjects', zach_number],
        enabled: !!token && !!zach_number,
        queryFn: async () => {
            const response = await fetch(`/student_info/subjects_by_zach?zach_number=${zach_number}`);

            return response.json();
        },
    })

    return data;
}