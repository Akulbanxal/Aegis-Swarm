import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

export class WebSocketServer {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // For demo purposes; restrict in production
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`[WS] Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`[WS] Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Broadcast an event to all connected clients.
   */
  public broadcast(event: string, payload: any) {
    this.io.emit(event, payload);
  }
}
