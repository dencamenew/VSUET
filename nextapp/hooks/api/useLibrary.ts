import { useMutation, useQuery } from "@tanstack/react-query";
import { useFetch } from "./useFetch";
import { useToken } from "../useAuth";

export interface ILibraryBook {
    author: string;
    file_id: string;
    filename: string;
    length: number;
    title: string;
    topic: string;
    uploadDate: string;
}

export function useLibraryList() {
    const fetch = useFetch();
    const { token } = useToken();

    const { data } = useQuery<ILibraryBook[]>({
        queryKey: ['library/list'],
        enabled: !!token,
        queryFn: async () => {
            const res = await fetch('/library/books', {
                method: "GET",
            });
            return res.json();
        }
    })

    return data;
}

export function useLibraryDownload() {
    const fetch = useFetch();

    return useMutation({
        mutationFn: async (filename: string) => {
            const response = await fetch(`/library/download/${encodeURIComponent(filename)}`);

            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            // Получаем файл как blob
            const blob = await response.blob();

            // Создаём ссылку для скачивания
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        },
    });

}