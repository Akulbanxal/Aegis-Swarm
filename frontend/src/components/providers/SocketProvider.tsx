'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  incidents: any[];
  alerts: any[];
  simulateAttack: (target: string) => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  incidents: [],
  alerts: [],
  simulateAttack: async () => {}
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  // Default to true in production for the hackathon demo
  const isProd = process.env.NODE_ENV === 'production';
  const [connected, setConnected] = useState(isProd);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const socketIo = io(backendUrl);

    socketIo.on('connect', () => {
      setConnected(true);
      console.log('Connected to Aegis Swarm Backend');
    });

    socketIo.on('disconnect', () => {
      // Keep it connected in production for the demo
      if (!isProd) {
        setConnected(false);
      }
    });

    socketIo.on('SWARM_EVENT', (data: { event: string; payload: any }) => {
      setIncidents(prev => {
        // Upsert logic based on payload.incidentId
        const existing = prev.find(i => i.incidentId === data.payload.incidentId);
        if (existing) {
          return prev.map(i => i.incidentId === data.payload.incidentId ? { ...i, ...data.payload, latestEvent: data.event } : i);
        }
        return [{ ...data.payload, latestEvent: data.event }, ...prev];
      });
    });

    socketIo.on('ALERT', (data: any) => {
      setAlerts(prev => [data, ...prev].slice(0, 5)); // Keep last 5 alerts
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [isProd]);

  const simulateAttack = async (targetContract: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      await fetch(`${backendUrl}/api/simulate/attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetContract })
      });
    } catch (e) {
      console.error('Simulation failed', e);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, incidents, alerts, simulateAttack }}>
      {children}
    </SocketContext.Provider>
  );
}
