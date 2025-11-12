// hooks/api/useStatements.ts
import { useMutation } from '@tanstack/react-query';
import { useFetch } from './useFetch';

// Хук для скачивания посещаемости
export function useDownloadAttendance() {
  const fetch = useFetch();

  return useMutation({
    mutationFn: async ({
      groupName,
      subjectType,
      subjectName,
    }: {
      groupName: string;
      subjectType: string;
      subjectName: string;
    }) => {
      const response = await fetch(
        `/vedomosti/attendance/${encodeURIComponent(groupName)}/${encodeURIComponent(subjectType)}/${encodeURIComponent(subjectName)}`
      );

      if (!response.ok) {
        throw new Error('Failed to download attendance');
      }

      // Получаем PDF как blob
      const blob = await response.blob();
      
      // Создаём ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `посещаемость_${groupName}_${subjectName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

// Хук для скачивания рейтинга
export function useDownloadRating() {
  const fetch = useFetch();

  return useMutation({
    mutationFn: async ({
      groupName,
      subjectName,
    }: {
      groupName: string;
      subjectName: string;
    }) => {
      const response = await fetch(
        `/vedomosti/rating/${encodeURIComponent(groupName)}/${encodeURIComponent(subjectName)}`
      );

      if (!response.ok) {
        throw new Error('Failed to download rating');
      }

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `рейтинг_${groupName}_${subjectName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

// Хук для скачивания среднего балла
export function useDownloadAverage() {
  const fetch = useFetch();

  return useMutation({
    mutationFn: async ({ groupName }: { groupName: string }) => {
      const response = await fetch(`/vedomosti/average/${encodeURIComponent(groupName)}`);

      if (!response.ok) {
        throw new Error('Failed to download average');
      }

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `средний_балл_${groupName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}
