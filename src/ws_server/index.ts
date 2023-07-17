import { RawData, WebSocketServer } from 'ws'
import { db } from './db'
import { RESPONSE_TYPES, ERROR_MESSAGES } from './constants'
import { toResponse, parseRawData } from './utils'
import { RegResponseI, CreateGameResponseI, UpdateRoomResponseI } from './types'

export const createWsServer = (port: number): void => {
  const wss = new WebSocketServer({ port })

  wss.on('connection', (ws) => {
    ws.on('error', console.error)

    ws.on('message', (rawData: RawData) => {
      console.log('received: %s', rawData)

      const { type, body } = parseRawData<any>(rawData)

      switch (type) {
        case RESPONSE_TYPES.REG: {
          const user = db.users.get(ws)

          if (!user) {
            const userToAdd = {
              index: db.users.size,
              name: body.name,
              password: body.password,
            }
            db.users.set(ws, userToAdd)
            const data: RegResponseI = {
              name: userToAdd.name,
              index: userToAdd.index,
              error: false,
              errorText: '',
            }
            const response = toResponse<RegResponseI>(RESPONSE_TYPES.REG, data)
            ws.send(response)
            break
          }

          if (user && user.password !== body.password) {
            const data: RegResponseI = {
              name: user.name,
              index: user.index,
              error: true,
              errorText: ERROR_MESSAGES.INVALID_PASSWORD,
            }
            const response = toResponse<RegResponseI>(RESPONSE_TYPES.REG, data)
            ws.send(response)
            break
          }

          const data: RegResponseI = {
            name: user.name,
            index: user.index,
            error: false,
            errorText: '',
          }
          const response = toResponse<RegResponseI>(RESPONSE_TYPES.REG, data)
          ws.send(response)

          const rooms = Object.values(db.rooms).map(r => ({ roomId: r.id, roomUsers: r.users }))
          const updateRoomResponse = toResponse<UpdateRoomResponseI>(
            RESPONSE_TYPES.UPDATE_ROOM, 
            rooms
          )
          ws.send(updateRoomResponse)

          break
        }
        case RESPONSE_TYPES.CREATE_ROOM: {
          const roomId = Object.keys(db.rooms).length
          const user = db.users.get(ws)
          if (user) {
            db.rooms[roomId] = {
              id: roomId,
              users: [{ index: user.index, name: user.name }],
            }
          }

          const rooms = Object.values(db.rooms).map(r => ({ roomId: r.id, roomUsers: r.users }))
          const updateRoomResponse = toResponse<UpdateRoomResponseI>(
            RESPONSE_TYPES.UPDATE_ROOM, 
            rooms
          )
          ws.send(updateRoomResponse)
          break;
        }
        case RESPONSE_TYPES.ADD_USER_TO_ROOM: {
          const roomId = body.indexRoom
          const room = db.rooms[roomId]
          const [{ index: firstUserId }] = room.users
          const firstUserWs = db.findUserKeyByIndex(firstUserId)
          const secondUser = db.users.get(ws)

          const gameId = Object.keys(db.games).length

          if (secondUser) {
            db.games[gameId] = {
              id: gameId, 
              users: [
              { userId: firstUserId },
              { userId: secondUser.index}
            ]}
          }

          const firstUserResponse = toResponse<CreateGameResponseI>(
            RESPONSE_TYPES.CREATE_GAME,
            { idGame: gameId, idPlayer: 0 }
          )
          const secondUserResponse = toResponse<CreateGameResponseI>(
            RESPONSE_TYPES.CREATE_GAME,
            { idGame: gameId, idPlayer: 1 }
          )
 
          if (firstUserWs) {
            firstUserWs.send(firstUserResponse)
          }
          ws.send(secondUserResponse)

          delete db.rooms[roomId];

          const rooms = Object.values(db.rooms).map(r => ({ roomId: r.id, roomUsers: r.users }))
          const updateRoomResponse = toResponse<UpdateRoomResponseI>(
            RESPONSE_TYPES.UPDATE_ROOM, 
            rooms
          )
          ws.send(updateRoomResponse)

          break;
        }
      }
    })

    ws.on('close', () => {
      db.users.delete(ws)
    })
  })
}
