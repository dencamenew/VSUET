import { useQuery } from "@tanstack/react-query";
import { useFetch } from "./useFetch";
import { useToken } from "../useAuth";

export interface ILessonSlot {
  name: string;
  group: string;
  auditorium: string;
  class_type: "лекция" | "практические занятия" | "лабораторная работа" | "семинар";
}

export type LessonTime = "08.00-09.35" | "09.45-11.20" | "11.50-13.25" | "13.35-15.10" | "15.20-16.55" | "17.05-18.40" | "18.50-20.25";
export type DayOfWeek = "ПОНЕДЕЛЬНИК" | "ВТОРНИК" | "СРЕДА" | "ЧЕТВЕРГ" | "ПЯТНИЦА";
export type WeekType = "Числитель" | "Знаменатель";

interface ITimetable {
  timetable: Record<WeekType, Record<DayOfWeek, Record<LessonTime, ILessonSlot>>>
}

export function useTimetable() {
  const fetch = useFetch();
  const { token } = useToken();

  const { data } = useQuery({
    queryKey: ["timetable", token],
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
}
