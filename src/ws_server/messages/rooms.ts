import { WebSocket } from 'ws';
import { DB } from '../db'
import { RESPONSE_TYPES } from './../constants'
import { toResponse } from './../utils'
import { UpdateRoomResponseI, CreateGameResponseI, AddUserToRoomBodyI } from './../types'

export const updateRoom = (ws: WebSocket, db: DB) => {
  const rooms = Object.values(db.rooms).map(r => ({ roomId: r.id, roomUsers: r.users }))
  const updateRoomResponse = toResponse<UpdateRoomResponseI>(
    RESPONSE_TYPES.UPDATE_ROOM, 
    rooms
  )
  ws.send(updateRoomResponse)
}

export const createRoom = (ws: WebSocket, db: DB) => {
  const roomId = Object.keys(db.rooms).length
  const user = db.users.get(ws)
  if (user) {
    db.rooms[roomId] = {
      id: roomId,
      users: [{ index: user.index, name: user.name }],
    }
  }
}

export const addUserToRoom = (ws: WebSocket, body: AddUserToRoomBodyI, db: DB) => {
  const roomId = body.indexRoom
  const room = db.rooms[roomId]
  const [{ index: firstUserId }] = room.users
  const secondUser = db.users.get(ws)

  if (!secondUser) return
  if (firstUserId === secondUser.index) return

  const gameId = Object.keys(db.games).length
  db.games[gameId] = {
    id: gameId, 
    users: [
    { userId: firstUserId },
    { userId: secondUser.index}
  ]}

  const firstUserResponse = toResponse<CreateGameResponseI>(
    RESPONSE_TYPES.CREATE_GAME,
    { idGame: gameId, idPlayer: 0 }
  )
  const secondUserResponse = toResponse<CreateGameResponseI>(
    RESPONSE_TYPES.CREATE_GAME,
    { idGame: gameId, idPlayer: 1 }
  )

  const firstUserWs = db.findUserKeyByIndex(firstUserId)
  if (firstUserWs) firstUserWs.send(firstUserResponse)
  ws.send(secondUserResponse)

  delete db.rooms[roomId];
}