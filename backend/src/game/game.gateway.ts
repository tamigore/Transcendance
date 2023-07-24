import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { GameService } from "./game.service";
import { JoinRoom } from "./game.interface"; 
import { RoomService } from "src/room/room.service";
// import { WsGuard } from "src/common/guards/ws.guard";

@WebSocketGateway(8081)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger("GameGateway");
  constructor(
    private gameService: GameService,
    private userService: UserService,
    private roomService: RoomService,
  ) {}

  @WebSocketServer()
  server: Server;

  // @UseGuards(WsGuard)
  async handleConnection(@MessageBody() client: Socket) {
    this.logger.debug(`user with socket ${client.id} connected`);
    this.logger.debug(`auth: ${client.handshake.auth.token}`);
    this.logger.debug("userID: " + client.handshake.query.userId);
    const userId: number = parseInt(client.handshake.query.userId.toString());
    const user = await this.userService.findById(userId);
    if (!user) throw new Error("handleConnection no user found");
    this.userService.updateGameSocket(user.id, client.id);
    // this.roomService.addUser(1, user.id);
    // this.server.in(client.id).socketsJoin("general");
    return client.id;
  }

  // @UseGuards(WsGuard)
  async handleDisconnect(client: Socket) {
    this.logger.log("GameGateway handleDisconnect clientid: ", client.id);
    this.logger.debug("client: " + client.handshake.query.userId);
    const userId: number = parseInt(client.handshake.query.userId.toString());
    const user = await this.userService.findById(userId);
    if (!user) throw new Error("handleDisconnect no user found");
    this.userService.updateGameSocket(user.id, "");
    // this.roomService.delUser(1, user.id);
    client.disconnect();
  }

  // @UseGuards(WsGuard)
  @SubscribeMessage("cliMessage")
  async onMessage(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
    this.logger.log("onMessage");
    this.logger.debug("body: ", body, "ConnectedSocket: ", client.id);
    this.gameService.createMessage(body.message, body.room.id, body.user.id);
    this.server.to(body.room.name).emit("servMessage", {
      user: body.user,
      message: body.message,
      room: body.room,
    });
  }

  // @UseGuards(WsThrottlerGuard)
  // @UsePipes(new ZodValidationPipe(JoinRoomSchema))
  // @UseGuards(WsGuard)
  @SubscribeMessage("join_room")
  async onJoinRoom(
    @MessageBody()
    payload: JoinRoom,
  ): Promise<boolean> {
    this.logger.log(`${payload.user.username} is joining ${payload.room.name}`);
    const user = await this.userService.findById(payload.user.id);
    if (!user) throw new Error("onJoinRoom no user found");
    let room = await this.roomService.findById(payload.room.id);
    if (!room) room = await this.roomService.createRoom(payload.room);
    this.server.in(user.gameSocket).socketsJoin(room.name);
    await this.roomService.addUser(room.id, user.id);
    return true;
  }
}
