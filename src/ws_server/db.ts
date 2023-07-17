import { WebSocket } from 'ws';
import { UserI, RoomI, GameI } from './types'

class DB {
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
}

export const db = new DB();