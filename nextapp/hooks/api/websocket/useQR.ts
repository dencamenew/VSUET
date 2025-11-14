// hooks/api/useQRSession.ts
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { useFetch } from '../useFetch';
import { useAPI } from '../useFetch';
import { useToken } from '@/hooks/useAuth';

interface QRSessionParams {
  group_name: string;
  subject_name: string;
  subject_type: string;
  date: string;
  lesson_start_time: string;
}

interface QRSessionResponse {
  session_id: string;
}

interface QRSessionData {
  token?: string;
  status?: string;
  error?: string;
  students?: Array<{
    name: string;
    zach_number: string;
    timestamp: string;
  }>;
}

export function useQRStudentScan() {
  const fetch = useFetch();

  const scanMutation = useMutation({
    mutationFn: async (qrData: string) => {
      // Парсим URL из QR кода
      const url = new URL(qrData);
      const sessionId = url.searchParams.get('session_id');
      const token = url.searchParams.get('token');

      if (!sessionId || !token) {
        throw new Error('Invalid QR code');
      }

      // Отправляем запрос на сервер
      const response = await fetch(`/qr/scan-qr?session_id=${sessionId}&token=${token}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark attendance');
      }

      return response.json();
    },
    onError: (error) => {
      console.error('Failed to mark attendance:', error);
    },
  });

  return {
    scan: scanMutation.mutate,
    isScanning: scanMutation.isPending,
    isSuccess: scanMutation.isSuccess,
    isError: scanMutation.isError,
    error: scanMutation.error,
    reset: scanMutation.reset,
  };
}

interface IQRTeacherList {
  status_code: number;
  session_id: string;
  students: string[];
}

export function useQRTeacherList(sessionId: string | undefined) {
  const fetch = useFetch();
  const { token } = useToken();

  const { data } = useQuery<IQRTeacherList>({
    enabled: !!token && !!sessionId,
    queryKey: ['qr-teacher-list', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];

      const response = await fetch(`/qr/session-students?session_id=${sessionId}`);

      return response.json();
    },
    refetchInterval: 7000,
    placeholderData: {
      status_code: 0,
      session_id: '',
      students: [],
    },
  })

  return data;
}

export function useQRTeacherSession() {
  const api = useAPI();
  const fetch = useFetch();
  const [sessionId, setSessionId] = useState<string | undefined>();

  // WebSocket подключение к сессии
  const wsResult = useWebSocket<QRSessionData>(
    sessionId ? `/session/${sessionId}` : null,
    undefined,
    {
      autoReconnect: false,
      sendToken: true,
    }
  );

  // Генерация URL для QR-кода
  const qrUrl = useMemo(() => {
    if (sessionId && wsResult.data?.token) {
      return `${api}/qr/scan-qr?session_id=${sessionId}&token=${wsResult.data.token}`;
    }
    return null;
  }, [sessionId, wsResult.data, api]);

  // Создание сессии через POST
  const createSessionMutation = useMutation({
    mutationFn: async (params: QRSessionParams): Promise<QRSessionResponse> => {
      const urlParams = new URLSearchParams(params as unknown as Record<string, string>);
      const response = await fetch(`/qr/generate-session?${urlParams}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // console.log('Session created:', data.session_id);
      setSessionId(data.session_id);
    },
    onError: (error) => {
      console.error('Failed to create session:', error);
    },
  });

  // Закрытие сессии
  const closeSession = useCallback(async () => {
    if (!sessionId) return;


    wsResult.close();

    try {
      const response = await fetch(`/qr/close-session?session_id=${sessionId}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error closing session:', error);
    }

    wsResult.reset();
    setSessionId(undefined);
  }, [sessionId, wsResult, fetch]);

  return {
    // Данные WebSocket
    data: wsResult.data,
    isConnected: wsResult.isConnected,
    error: wsResult.error || createSessionMutation.error,

    // URL для QR-кода
    qrUrl,

    // Методы
    createSession: createSessionMutation.mutate,
    closeSession,

    // Статус
    isCreating: createSessionMutation.isPending,
    isActive: !!sessionId && wsResult.isConnected,
    sessionId,
  };
}
