import { useQuery } from "@tanstack/react-query";
import { useToken } from "../useAuth";
import { useFetch } from "./useFetch";

export function useStudentInfo(zach_number: string | undefined) {
    const fetch = useFetch();
    const { token } = useToken();

    const { data } = useQuery({
        queryKey: ['studentInfo', zach_number],
        enabled: !!token && !!zach_number,
        queryFn: async () => {
            const response = await fetch(`/student_info/zach_info?zach=${zach_number}`);

            return response.json();
        },
    })

    return data;
}