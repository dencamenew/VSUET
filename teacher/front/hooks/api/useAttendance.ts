import { useQuery } from "@tanstack/react-query";
import { useFetch } from "./useFetch";
import { useToken } from "../useAuth";

// region Teacher

interface IAttendanceTeacher {

}

export function useAttendanceTeacher(
    groupName: string | undefined,
    subjectType: string | undefined,
    subjectName: string | undefined
) {
    const fetch = useFetch();
    const { token } = useToken();
    
    const { data } = useQuery({
        queryKey: ["attendance/teacher", groupName, subjectType, subjectName, token],
        enabled: !!token && !!groupName && !!subjectType && !!subjectName,
        queryFn: async (): Promise<IAttendanceTeacher> => {
            const encodedGroup = encodeURIComponent(groupName!);
            const encodedType = encodeURIComponent(subjectType!);
            const encodedName = encodeURIComponent(subjectName!);

            const response = await fetch(
                `/attendance/teacher/${encodedGroup}/${encodedType}/${encodedName}`,
                {
                    method: "GET",
                }
            );

            return await response.json();
        },
    });

    return data;
}
