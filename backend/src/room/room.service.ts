import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { Room, User } from "@prisma/client";
import * as RoomTypes from "./dto/types";
import * as argon2 from "argon2/argon2";

@Injectable()
export class RoomService implements OnModuleInit {
  private logger: Logger = new Logger("RoomService");
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    const general = await this.prisma.room.findFirst({ where: { id: 1 } });
    if (!general || !general.id) {
      await this.prisma.room
        .create({
          data: {
            name: "general",
          },
          include: {
            users: true,
          },
        })
        .then((user) => {
          this.logger.log("onModuleInit create success: ", user);
        })
        .catch((error) => {
          this.logger.error("onModuleInit create error: ", error);
        });
    }
  }

  higherRights(
    room: RoomTypes.RoomWithAll,
    userId: number,
    pawnId: number,
  ): boolean {
    if (
      // this.isUser(room, pawnId) &&
      !this.isOwner(room, pawnId) &&
      (this.isOwner(room, userId) ||
        (this.isAdmin(room, userId) && !this.isAdmin(room, pawnId)))
    )
      return true;
    return false;
  }

  isOwner(room: RoomTypes.RoomWihtOwner, userId: number): boolean {
    if (
      typeof room != "undefined" &&
      room &&
      typeof room.owner != "undefined" &&
      room.owner &&
      room.owner.id &&
      room.owner.id === userId
    )
      return true;
    return false;
  }

  isAdmin(room: RoomTypes.RoomWithAdmins, userId: number): boolean {
    if (
      typeof room != "undefined" &&
      room &&
      typeof room.admins != "undefined" &&
      room.admins &&
      room.admins.length &&
      room.admins.find((x: User) => x.id === userId)
    )
      return true;
    return false;
  }

  isUser(room: RoomTypes.RoomWithUsers, userId: number): boolean {
    if (
      typeof room != "undefined" &&
      room &&
      typeof room.users != "undefined" &&
      room.users &&
      room.users.length &&
      room.users.find((x: User) => x.id === userId)
    )
      return true;
    return false;
  }

  isBan(room: RoomTypes.RoomWithBan, userId: number): boolean {
    if (
      typeof room != "undefined" &&
      room &&
      typeof room.ban != "undefined" &&
      room.ban &&
      room.ban.length &&
      room.ban.find((x: User) => x.id === userId)
    )
      return true;
    return false;
  }

  isMute(room: RoomTypes.RoomWithMute, userId: number): boolean {
    if (
      typeof room != "undefined" &&
      room &&
      typeof room.mute != "undefined" &&
      room.mute &&
      room.mute.length &&
      room.mute.find((x: User) => x.id === userId)
    )
      return true;
    return false;
  }

  async findAll() {
    this.logger.log("findAll rooms");
    return await this.prisma.room.findMany();
  }

  async findAllIncludes() {
    this.logger.log("findAll Include rooms");
    return await this.prisma.room
      .findMany({
        include: {
          owner: true,
          admins: true,
          users: true,
          mute: true,
          ban: true,
          messages: true,
        },
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  async findAllPublic() {
    this.logger.log("findAllPublic rooms");
    return await this.prisma.room
      .findMany({
        where: { private: false },
        include: {
          owner: true,
          admins: true,
          users: true,
          ban: true,
          mute: true,
          messages: true,
        },
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  async findByName(name: string) {
    this.logger.log(`findByName room: ${name}`);
    return await this.prisma.room
      .findUnique({
        where: { name: name },
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  async findById(id: number) {
    this.logger.log(`findById room: ${id}`);
    return await this.prisma.room
      .findUnique({
        where: { id: id },
        include: { mute: true },
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  async findByIdWithAll(id: number) {
    this.logger.log(`findById room: ${id}`);
    return await this.prisma.room
      .findUnique({
        where: { id: id },
        include: {
          owner: true,
          admins: true,
          users: true,
          mute: true,
          ban: true,
          messages: true,
        },
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  async findByIdWithUser(id: number): Promise<RoomTypes.RoomWithUsers> {
    this.logger.log(`findById room: ${id}`);
    return await this.prisma.room
      .findUnique({
        where: { id: id },
        include: {
          users: true,
        },
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  async createRoom(room: Room) {
    this.logger.log("createRoom: " + room);
    if (!room) return null;
    const findRoom = await this.findByName(room.name);
    if (typeof findRoom !== "undefined" && findRoom && findRoom.id)
      return findRoom;
    let password = null;
    if (room.hash) {
      password = await argon2.hash(room.hash);
    }
    return await this.prisma.room
      .create({
        data: {
          name: room.name,
          owner: {
            connect: {
              id: room.ownerId,
            },
          },
          users: {
            connect: {
              id: room.ownerId,
            },
          },
          hash: password,
        },
        include: {
          users: true,
          admins: true,
          ban: true,
          mute: true,
        },
      })
      .then((newRoom) => {
        // this.logger.log("createRoom success: ", newRoom);
        return newRoom;
      })
      .catch((error) => {
        // this.logger.error("createRoom error: ", error);
        throw new Error(error);
      });
  }

  async findPrivateRooms(userId: number) {
    return await this.prisma.room
      .findMany({
        where: {
          AND: [
            {
              private: true,
            },
            {
              users: {
                some: {
                  id: userId,
                },
              },
            },
          ],
        },
      })
      .catch((error) => {
        throw error;
      });
  }

  async getPrivateRoom(user1: User, user2: User) {
    this.logger.log(
      `getPrivateRoom of ${user1.username} and ${user2.username}`,
    );
    return await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room
          .findFirst({
            where: {
              private: true,
              OR: [
                { name: `${user1.username} & ${user2.username} Room` },
                { name: `${user2.username} & ${user1.username} Room` },
              ],
            },
          })
          .catch((error) => {
            throw new Error(error);
          });
        if (typeof room !== "undefined" && room) {
          return room;
        }
        return await prisma.room
          .create({
            data: {
              name: `${user1.username} & ${user2.username} Room`,
              private: true,
              users: {
                connect: [{ id: user1.id }, { id: user2.id }],
              },
            },
          })
          .catch((error) => {
            throw new Error(error);
          });
      })
      .catch((error) => {
        throw new Error(`getPrivateRoom failure: ${error}`);
      });
  }

  async update(userId: number, roomDto: Room) {
    this.logger.log(`user id : ${userId} wants to update room: ${roomDto}`);
    await this.prisma.room
      .update({
        where: { id: roomDto.id },
        data: {
          name: roomDto.name,
        },
      })
      .then((updatedRoom) => {
        // this.logger.log("Room update success: ", updatedRoom);
        return updatedRoom;
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async addUser(roomId: number, userId: number, pwd: string): Promise<boolean> {
    this.logger.log(`addUser: ${userId} to room: ${roomId}`);
    return await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            ban: true,
          },
        });
        if (typeof room === "undefined" || !room || this.isBan(room, userId))
          return false;
        if (room.hash) {
          // this.logger.debug(pwd);
          // this.logger.debug(room.hash);
          const verif = await argon2.verify(room.hash, pwd);
          if (!verif) return false;
        }
        if (room.ban.find((user) => user.id === userId)) return false;
        return await this.prisma.room.update({
          where: { id: roomId },
          data: {
            users: {
              connect: [
                {
                  id: userId,
                },
              ],
            },
          },
          include: {
            users: true,
          },
        });
      })
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  async addAdmin(roomId: number, userId: number, adminId: number) {
    this.logger.log(`addAdmin: ${userId} to room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: { owner: true },
        });
        if (!this.isOwner(room, userId))
          throw new Error(`User ${userId} doesn't own room ${roomId}`);
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            admins: {
              connect: [
                {
                  id: adminId,
                },
              ],
            },
          },
          include: {
            admins: true,
          },
        });
      })
      .then((room) => {
        return room;
        // this.logger.log("addAdmin success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async delAdmin(roomId: number, userId: number, adminId: number) {
    this.logger.log(`delAdmin: ${userId} to room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: { owner: true },
        });
        if (!this.isOwner(room, userId))
          throw new Error(`User ${userId} doesn't own room ${roomId}`);
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            admins: {
              disconnect: [
                {
                  id: adminId,
                },
              ],
            },
          },
          include: {
            admins: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("delAdmin success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async addBan(roomId: number, userId: number, banId: number) {
    this.logger.log(`addBan: ${userId} to room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            owner: true,
            admins: true,
            users: true,
            ban: true,
            mute: true,
            messages: true,
          },
        });
        if (!this.higherRights(room, userId, banId))
          throw new Error(
            `User ${userId} donesn't have rights on room ${roomId}`,
          );
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            ban: {
              connect: [
                {
                  id: banId,
                },
              ],
            },
            admins: {
              disconnect: [
                {
                  id: banId,
                },
              ],
            },
            users: {
              disconnect: [
                {
                  id: banId,
                },
              ],
            },
          },
          include: {
            ban: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("addBan success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async delBan(roomId: number, userId: number, banId: number) {
    this.logger.log(`delBan: ${userId} to room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        // const room = await prisma.room.findUnique({
        //   where: { id: roomId },
        //   include: {
        //     owner: true,
        //     admins: true,
        //     users: true,
        //     ban: true,
        //     mute: true,
        //     messages: true,
        //   },
        // });
        // if (!this.higherRights(room, userId, banId))
        //   throw new Error(
        //     `User ${userId} donesn't have rights on room ${roomId}`,
        //   );
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            ban: {
              disconnect: [
                {
                  id: banId,
                },
              ],
            },
          },
          include: {
            ban: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("delBan success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async addMute(roomId: number, userId: number, muteId: number) {
    this.logger.log(`addMute: ${userId} to room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            owner: true,
            admins: true,
            users: true,
            ban: true,
            mute: true,
            messages: true,
          },
        });
        if (!this.higherRights(room, userId, muteId))
          throw new Error(
            `User ${userId} donesn't have rights on room ${roomId}`,
          );
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            mute: {
              connect: [
                {
                  id: muteId,
                },
              ],
            },
          },
          include: {
            mute: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("addMute success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async delMute(roomId: number, userId: number, muteId: number) {
    this.logger.log(`delMute: ${userId} to room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            owner: true,
            admins: true,
            users: true,
            ban: true,
            mute: true,
            messages: true,
          },
        });
        if (!this.higherRights(room, userId, muteId))
          throw new Error(
            `User ${userId} donesn't have rights on room ${roomId}`,
          );
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            mute: {
              disconnect: [
                {
                  id: muteId,
                },
              ],
            },
          },
          include: {
            mute: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("delMute success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async remove(userId: number, roomId: number) {
    this.logger.log(`user id : ${userId} wants to removeById room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room
          .findUnique({
            where: { id: roomId },
            include: { owner: true },
          })
          .catch((/*error*/) => {
            return null; //throw new Error(error);
          });
        if (userId !== room.owner.id)
          throw new Error(`User ${userId} doesn't own room ${roomId}`);
        prisma.room
          .update({
            where: { id: roomId },
            data: {
              users: {
                set: [],
              },
              admins: {
                set: [],
              },
              ban: {
                set: [],
              },
              mute: {
                set: [],
              },
              owner: {
                disconnect: true,
              },
            },
          })
          .catch((/*error*/) => {
            return null; //throw new Error(error);
          });
        return prisma.room.delete({
          where: { id: roomId },
        });
      })
      .then((res) => {
        this.logger.log("remove success: ", res);
      })
      .catch((/*error*/) => {
        return null; // throw new Error(error);
      });
  }

  async removeUser(roomId: number, userId: number, removeId: number) {
    this.logger.log(`del user: ${userId} from room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            owner: true,
            admins: true,
            users: true,
            ban: true,
            mute: true,
            messages: true,
          },
        });
        if (!room) return false;
        if (userId !== removeId) {
          if (!this.higherRights(room, userId, removeId)) return false;
          // throw new Error(
          //   `User ${userId} donesn't have rights on room ${roomId}`,
          // );
        }
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            admins: {
              disconnect: [
                {
                  id: removeId,
                },
              ],
            },
            users: {
              disconnect: [
                {
                  id: removeId,
                },
              ],
            },
          },
          include: {
            users: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("removeUser success: ", room);
      })
      .catch((/*error*/) => {
        return false;
        // throw new Error(error);
      });
  }

  async removeAdmin(roomId: number, userId: number, removeId: number) {
    this.logger.log(`del admin: ${userId} from room: ${roomId}`);
    await this.prisma
      .$transaction(async (prisma) => {
        if (userId !== removeId) {
          const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
              owner: true,
            },
          });
          if (!this.isOwner(room, userId))
            throw new Error(
              `User ${userId} donesn't have rights on room ${roomId}`,
            );
        }
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            admins: {
              disconnect: [
                {
                  id: removeId,
                },
              ],
            },
          },
          include: {
            admins: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("removeAdmin success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async removeBan(roomId: number, userId: number, banId: number) {
    this.logger.log(`del ban: ${userId} from room: ${roomId}`);
    if (userId === banId) return;
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            owner: true,
            admins: true,
            users: true,
            ban: true,
            mute: true,
            messages: true,
          },
        });
        if (!this.higherRights(room, userId, banId))
          throw new Error(
            `User ${userId} donesn't have rights on room ${roomId}`,
          );
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            ban: {
              disconnect: [
                {
                  id: banId,
                },
              ],
            },
          },
          include: {
            ban: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("removeBan success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  async removeMute(roomId: number, userId: number, muteId: number) {
    this.logger.log(`del user: ${userId} from room: ${roomId}`);
    if (userId === muteId) return;
    await this.prisma
      .$transaction(async (prisma) => {
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: {
            owner: true,
            admins: true,
            users: true,
            ban: true,
            mute: true,
            messages: true,
          },
        });
        if (!this.higherRights(room, userId, muteId))
          throw new Error(
            `User ${userId} donesn't have rights on room ${roomId}`,
          );
        return await prisma.room.update({
          where: { id: roomId },
          data: {
            mute: {
              disconnect: [
                {
                  id: muteId,
                },
              ],
            },
          },
          include: {
            mute: true,
          },
        });
      })
      .then((room) => {
        this.logger.log("removeMute success: ", room);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
}
