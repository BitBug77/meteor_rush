"use client"

import { useEffect, useState, useRef } from 'react'

const HandController = ({ onJump, enabled = true }: { 
  onJump: () => void, 
  enabled?: boolean 
}) => {
  const [status, setStatus] = useState('Connecting...')
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 5
  const lastJumpTime = useRef(Date.now())

  useEffect(() => {
    let isMounted = true
    const connectWebSocket = () => {
      if (!enabled || !isMounted) return

      socketRef.current = new WebSocket('ws://localhost:8765')

      socketRef.current.onopen = () => {
        reconnectAttempts.current = 0
        setStatus('Connected')
      }

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.action === 'jump') {
            const now = Date.now()
            if (now - lastJumpTime.current > 500) {
              onJump()
              lastJumpTime.current = now
            }
          }
        } catch (error) {
          console.error('Error parsing message:', error)
        }
      }

      socketRef.current.onclose = (event) => {
        if (!isMounted) return
        setStatus('Disconnected')
        
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 10000)
          reconnectTimerRef.current = setTimeout(() => {
            reconnectAttempts.current += 1
            connectWebSocket()
          }, delay)
          setStatus(`Reconnecting (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})...`)
        }
      }

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        if (!isMounted) return
        setStatus('Connection Error')
      }
    }

    connectWebSocket()

    return () => {
      isMounted = false
      if (socketRef.current) socketRef.current.close()
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    }
  }, [enabled, onJump])

  return (
    <div className="hand-controller">
      <div className={`status-indicator ${status.toLowerCase().replace(/\s+/g, '-')}`}>
        Motion Control: {status}
      </div>
      <style jsx>{`
        .hand-controller {
          position: fixed;
          top: 10px;
          left: 10px;
          z-index: 1000;
        }
        .status-indicator {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          transition: background-color 0.3s, color 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .connected {
          background-color: rgba(0, 255, 0, 0.2);
          color: #008000;
          border: 1px solid #00a000;
        }
        .disconnected {
          background-color: rgba(255, 0, 0, 0.2);
          color: #800000;
          border: 1px solid #a00000;
        }
        .error, .connection-error, .failed-to-connect {
          background-color: rgba(255, 165, 0, 0.2);
          color: #ff6600;
          border: 1px solid #ff8000;
        }
        .disabled {
          background-color: rgba(128, 128, 128, 0.2);
          color: #666666;
          border: 1px solid #888888;
        }
        .reconnecting-1-5, .reconnecting-2-5, .reconnecting-3-5, .reconnecting-4-5, .reconnecting-5-5 {
          background-color: rgba(255, 255, 0, 0.2);
          color: #707000;
          border: 1px solid #909000;
        }
      `}</style>
    </div>
  )
}

export default HandController