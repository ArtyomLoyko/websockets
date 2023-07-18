import { WebSocket } from 'ws';
import { UserI, RoomI, GameI } from './types'

export class DB {
  users: Map<WebSocket, UserI>;
  rooms: Record<number, RoomI>;
  games: Record<number, GameI>;

  constructor() {
    this.users = new Map();
    this.rooms = {};
    this.games = {};
  }

  findUserKeyByIndex(index: number): WebSocket | null {
    let result = null
    for (const [key, user] of this.users) {
      if (user.index === index) {
        result = key;
      }
    }
    return result
  }

  get usersKeys(): WebSocket[] {
    return Array.from(this.users.keys())
  }

  get usersValues(): UserI[] {
    return Array.from(this.users.values())
  }
}

export const db = new DB();