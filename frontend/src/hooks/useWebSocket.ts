import { useEffect, useRef, useCallback, useState } from 'react'

type WebSocketMessage = Record<string, unknown>

interface UseWebSocketOptions {
  url: string
  onMessage?: (data: WebSocketMessage) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnect?: boolean
  reconnectInterval?: number
  reconnectAttempts?: number
}

interface UseWebSocketReturn {
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  send: (data: WebSocketMessage) => void
  connect: () => void
  disconnect: () => void
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
    reconnectInterval = 3000,
    reconnectAttempts = 5,
  } = options

  const wsRef = useRef<WebSocket | null>(null)
  const attemptsRef = useRef(0)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(url)

    ws.onopen = () => {
      setIsConnected(true)
      attemptsRef.current = 0
      onOpen?.()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage
        setLastMessage(data)
        onMessage?.(data)
      } catch {
        setLastMessage({ raw: event.data })
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      onClose?.()

      if (reconnect && attemptsRef.current < reconnectAttempts) {
        attemptsRef.current += 1
        setTimeout(() => connect(), reconnectInterval)
      }
    }

    ws.onerror = (error) => {
      onError?.(error)
    }

    wsRef.current = ws
  }, [url, onMessage, onOpen, onClose, onError, reconnect, reconnectInterval, reconnectAttempts])

  const disconnect = useCallback(() => {
    attemptsRef.current = reconnectAttempts
    wsRef.current?.close()
    wsRef.current = null
    setIsConnected(false)
  }, [reconnectAttempts])

  const send = useCallback((data: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    lastMessage,
    send,
    connect,
    disconnect,
  }
}
