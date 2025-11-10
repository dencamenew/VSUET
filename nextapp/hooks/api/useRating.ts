import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToken } from "../useAuth";
import { useFetch } from "./useFetch";

export interface ICheckpoints {
    kt1: number;
    kt2: number;
    kt3: number;
    kt4: number;
    kt5: number;
}

export interface ITextGrade {
    grade: "Неудовлетворительно" | "Удовлетворительно" | "Хорошо" | "Отлично";
}

export interface IStudentRatingNumeric {
    student_id: string;
    rating: ICheckpoints;
}

export interface IStudentRatingText {
    student_id: string;
    grade: string;
}

export type IStudentRating = IStudentRatingNumeric | IStudentRatingText;

export interface IRatingTeacher {
    group_name: string;
    subject_name: string;
    requested_by: string;
    ratings: IStudentRating[];
    rating_type: "numeric" | "text";
}

export function isNumericRating(rating: IStudentRating): rating is IStudentRatingNumeric {
    return "rating" in rating;
}

export function isTextRating(rating: IStudentRating): rating is IStudentRatingText {
    return "grade" in rating;
}

export const TEXT_GRADES = {
    UNSATISFACTORY: "Неудовлетворительно",
    SATISFACTORY: "Удовлетворительно",
    GOOD: "Хорошо",
    EXCELLENT: "Отлично",
} as const;


interface ISubjectWithCheckpoints extends ICheckpoints {
    type: string;
}

interface ISubjectWithGrade {
    type: string;
    grade: string;
}

export type ISubjectRating = ISubjectWithCheckpoints | ISubjectWithGrade;

export interface IRatingStudent {
    ratings: Record<string, ISubjectRating>;
    requested_by: string;
}

export function useRatingStudent(
    studentCard: string | undefined,
) {
    const fetch = useFetch();
    const { token } = useToken();

    const { data } = useQuery({
        queryKey: ["rating/student", studentCard],
        enabled: !!token && !!studentCard,
        queryFn: async (): Promise<IRatingStudent> => {
            const response = await fetch(
                `/rating/student/${studentCard}`,
                {
                    method: "GET",
                }
            );

            return await response.json();
        },
    });

    return data;
}


// region Teacher

export function useRatingTeacherMark() {
    const queryClient = useQueryClient();
    const fetch = useFetch();

    const mutation = useMutation({
        mutationFn: async (params: {
            group_name: string,
            zach_number: string,
            subject_name: string,
            control_point: string,
            mark: number | string
        }) => {
            const { group_name, ...requestBody } = params;

            const response = await fetch(
                "/rating/mark",
                {
                    method: "PUT",
                    body: JSON.stringify(requestBody),
                }
            );

            return response.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "rating/teacher",
                    variables.group_name,
                    variables.subject_name,
                ],
            });
        },
    });

    return mutation;
}

export function useRatingTeacher(
    groupName: string | undefined,
    subjectName: string | undefined,
) {
    const fetch = useFetch();
    const { token } = useToken();

    const { data } = useQuery({
        queryKey: ["rating/teacher", groupName, subjectName],
        enabled: !!token && !!groupName && !!subjectName,
        queryFn: async (): Promise<IRatingTeacher> => {
            const encodedGroup = (groupName!);
            const encodedName = (subjectName!);

            const response = await fetch(
                `/rating/vedomost/${groupName}&${subjectName}`,
                {
                    method: "GET",
                }
            );

            return await response.json();
        },
    });

    return data;
}