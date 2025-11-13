import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "./useFetch";
import { useToken } from "../useAuth";

// region Student

export interface IAttendanceStudent {
    attendance: {
        subject_name: string,
        subject_type: string,
        attendance: {
            [key: string]: boolean
        }[]
    }
}

export function useAttendanceStudent(subjectName: string | undefined, subjectType: string | undefined) {
    const fetch = useFetch();
    const { token } = useToken();

    const { data } = useQuery<IAttendanceStudent>({
        queryKey: ["attendance/student"],
        enabled: !!token && !!subjectName && !!subjectType,
        queryFn: async () => {
            const response = await fetch(
                `/attendance/student/${subjectName}/${subjectType}`,
                {
                    method: "GET",
                }
            )

            return response.json();
        }
    })

    return data;
}

// region Teacher

export interface IAttendanceRow {
    attendance: {
        [key: string]: boolean,
    }[],
    student_id: number
};

export type IAttendaceTable = IAttendanceRow[];

export interface IAttendanceTeacher {
    attendance_json: IAttendaceTable,
    created_at: string,
    group_id: number,
    id: number,
    semestr: string,
    subject_name: string,
    subject_type: string,
    teacher_id: number
};

export function useToggleAttendanceTeacher() {
    const queryClient = useQueryClient();
    const fetch = useFetch();

    const mutation = useMutation({
        mutationFn: async (params: {
            group_name: string;
            subject_name: string;
            subject_type: string;
            date: string;
            zach: string;
            status: boolean;
        }) => {
            const queryParams = new URLSearchParams({
                group_name: params.group_name,
                subject_name: params.subject_name,
                subject_type: params.subject_type,
                date: params.date,
                zach: params.zach,
                status: params.status.toString(),
            });

            const response = await fetch(
                `/attendance/teacher/mark-to-one?${queryParams.toString()}`,
                {
                    method: "POST",
                }
            );

            return response.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "attendance/teacher",
                    variables.group_name,
                    variables.subject_type,
                    variables.subject_name,
                ],
            });
        },
    });

    return mutation;
}


export function useAttendanceTeacher(
    groupName: string | undefined,
    subjectType: string | undefined,
    subjectName: string | undefined
) {
    const fetch = useFetch();
    const { token } = useToken();

    const { data } = useQuery({
        queryKey: ["attendance/teacher", groupName, subjectType, subjectName],
        enabled: !!token && !!groupName && !!subjectType && !!subjectName,
        queryFn: async (): Promise<IAttendanceTeacher> => {
            const encodedGroup = (groupName!);
            const encodedType = (subjectType!);
            const encodedName = (subjectName!);

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
};