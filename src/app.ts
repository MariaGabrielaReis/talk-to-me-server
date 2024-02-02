import express, { Application } from "express";
import http from "http";
import { Server, Socket } from "socket.io";

export class App {
  private app: Application;
  private http: http.Server;
  private io: Server;

  constructor() {
    this.app = express();
    this.http = new http.Server(this.app);
    this.io = new Server(this.http, { cors: { origin: "*" } });
  }

  public listen() {
    this.http.listen(3333, () =>
      console.log("Server is runing on port 3333 🔥"),
    );
  }

  public listenSocket() {
    this.io.of("/meeting").on("connection", this.socketEvents);
  }

  private socketEvents(socket: Socket) {
    socket.on("subscribe", data => {
      socket.join(data.meetingId);

      socket.on("chat", data =>
        socket.broadcast.to(data.meetingId).emit("chat", {
          text: data.text,
          username: data.username,
          time: data.time,
        }),
      );
    });
  }
}
