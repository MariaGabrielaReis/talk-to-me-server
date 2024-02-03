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
      socket.join(data.socketId);

      const meetingsSession = Array.from(socket.rooms);
      if (meetingsSession.length > 0) {
        socket.to(data.meetingId).emit("new user", {
          socketId: socket.id,
          username: data.username,
        });
      }
    });

    socket.on("new user connected", data =>
      socket.to(data.to).emit("new user connected", { sender: data.sender }),
    );

    socket.on("sdp", data =>
      socket.to(data.to).emit("sdp", {
        description: data.description,
        sender: data.sender,
      }),
    );

    socket.on("ice candidates", data =>
      socket.to(data.to).emit("ice candidates", {
        candidate: data.candidate,
        sender: data.sender,
      }),
    );

    socket.on("chat", data =>
      socket.broadcast.to(data.meetingId).emit("chat", {
        text: data.text,
        username: data.username,
        time: data.time,
      }),
    );
  }
}
