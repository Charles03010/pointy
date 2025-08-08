"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => {
  return useContext(SocketContext);
};
export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.WEB_SOCKET_URL || "https://ws.surly.my.id/", {
    // const newSocket = io(process.env.WEB_SOCKET_URL || "https://192.168.2.2:8765/", {
      transports: ["websocket"]
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server with ID:', newSocket.id);
    });
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};