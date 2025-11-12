// hooks/api/useWebSocketAPI.ts
import { useToken } from '@/hooks/useAuth';
import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  sendToken?: boolean;
}

export function useWebSocket<T>(
  endpoint: string | null,
  params?: Record<string, string> | undefined,
  options: WebSocketOptions = {}
) {
  const {
    autoReconnect = true,
    reconnectInterval = 3000,
    sendToken = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { token } = useToken();

  const connect = useCallback(() => {
    if (!endpoint) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    
    // Добавляем параметры к URL
    let url = `${wsUrl}${endpoint}`;
    if (params) {
        console.log(params)
      const queryParams = new URLSearchParams(params);
      url += `?${queryParams}`;
    }

    console.log('Connecting to:', url);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
      
      // Отправляем токен если нужно
    //   if (sendToken && token) {
    //     ws.send(JSON.stringify({ token }));
    //   }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setData(message);
      } catch (err) {
        console.error('Error parsing message:', err);
        setError('Failed to parse message');
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      if (autoReconnect) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Reconnecting...');
          connect();
        }, reconnectInterval);
      }
    };
  }, [endpoint, params, token, sendToken, autoReconnect, reconnectInterval]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const close = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    setIsConnected(false);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket is not connected');
    return false;
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isConnected,
    error,
    send,
    close,
    reset,
  };
}
