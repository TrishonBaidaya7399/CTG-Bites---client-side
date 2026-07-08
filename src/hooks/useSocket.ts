"use client";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface UseSocketOptions {
  // When provided, socket authenticates as staff using a freshly-issued token from
  // /api/auth/socket-token (proxy route). Omit for anonymous customer/table connections.
  accessToken?: string | null;
}

// Connects once per mount. Socket.io is the one connection allowed to talk directly
// to the backend origin (WebSockets can't be proxied through Vercel serverless routes).
export function useSocket({ accessToken }: UseSocketOptions = {}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      let token: string | undefined;

      if (accessToken) {
        try {
          const res = await fetch("/api/auth/socket-token", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = await res.json();
          if (res.ok && data.token) {
            token = data.token;
          }
        } catch {
          // fall through — connect anonymously if token fetch fails
        }
      }

      if (cancelled) return;

      const s = io(SOCKET_URL, {
        auth: token ? { token } : undefined,
        transports: ["websocket", "polling"],
      });

      socketRef.current = s;
      setSocket(s);
    }

    connect();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [accessToken]);

  return socket;
}
