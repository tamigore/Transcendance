export interface User {
  id: number,
  created_at: Date,
  updated_at: Date,
  
  email: string,
  username: string | null,
  hash: string,
  hashRt: string | null,
  chatSocket: string | null,
  gameSocket: string | null,
  loggedIn: boolean,
  bio: string | null,
  img: string | null, //Path to img src
  owner: Room[],
  admin: Room[],
  rooms: Room[],
  messages: Message[],
  win: Historic,
  loose: Historic,
}

export interface Game {
	id: number,
	created_at: Date,
  
	name: string,
	player1Id: number,
	player1: User,
	player2Id: number,
	player2: User,
	spectator: User[],
	historic: Historic,
}

export interface Play {
	player1up: boolean;
	player1down: boolean;
	player2up: boolean;
	player2down: boolean;
}

export interface Historic {
  id: number,
  created_at: Date,

  winnerID: number,
  winner: User,
  looserID: number,
  looser: User,
  score: string,
}

export interface Message {
  id: number,
  created_at: Date,

  text: string,
  roomId: number,
  room: Room,
  userId: number,
  user: User,
}

export interface Room {
  id: number,
  created_at: Date,

  name: string,
  ownerId: number,
  owner: User,
  admin: User[],
  users: User[],
  messages: Message[],
  description: string | null,
}