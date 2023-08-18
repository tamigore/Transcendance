import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Game, User, Room } from "@prisma/client";


export class Matchmaker {
  userId: string;
  userName: string;
  isBlocked: boolean;
}

export class Spectate{
  userId: string;
  userName: string;
  userPlaying: number;
}

export interface GameMove {
    player: number,
  
    notPressed: boolean,
    key: number,
    gameRoom: string,
  }

  export interface BallState
  {
    ballId: number,
    ballX: number,
    ballY: number,
    ballVeloX: number,
    ballVeloY: number,
    player: number,
  }

  export interface BlockState
{
  effect: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  id: number,
}

  export interface PaddleState
  {
    player: number,
    posY: number,
    height: number,
  }

  export interface GameScore
  {
    scoreA: number,
    scoreB: number,
  }

