import { RawData, WebSocketServer } from 'ws'
import { db } from './db'
import { RESPONSE_TYPES } from './constants'
import { parseRawData } from './utils'
import { updateRoom, createRoom, addUserToRoom } from './messages/rooms'
import { userNotFound, invalidPassword, successLogin } from './messages/users'

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
            userNotFound(ws, body, db)
            break
          }

          if (user && user.password !== body.password) {
            invalidPassword(ws, user)
            break
          }

          successLogin(ws, user)
          updateRoom(ws, db)
          break
        }
        case RESPONSE_TYPES.CREATE_ROOM: {
          createRoom(ws, db);
          updateRoom(ws, db);
          break;
        }
        case RESPONSE_TYPES.ADD_USER_TO_ROOM: {
          addUserToRoom(ws, body, db);
          updateRoom(ws, db);
          break;
        }
      }
    })

    ws.on('close', () => {
      db.users.delete(ws)
    })
  })
}
