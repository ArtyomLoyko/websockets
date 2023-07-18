import { RawData, WebSocketServer } from 'ws'
import { db } from './db'
import { RESPONSE_TYPES } from './constants'
import { parseRawData } from './utils'
import { RegBodyI, AddUserToRoomBodyI, AddShipsBodyI } from './types'
import { updateRoom, createRoom, addUserToRoom } from './messages/rooms'
import { userNotFound, invalidPassword, successLogin } from './messages/users'
import { addShips } from './messages/ships'

export const createWsServer = (port: number): void => {
  const wss = new WebSocketServer({ port })

  wss.on('connection', (ws) => {
    ws.on('error', console.error)

    ws.on('message', (rawData: RawData) => {
      const parsedData = parseRawData(rawData)

      switch (parsedData.type) {
        case RESPONSE_TYPES.REG: {
          const body = parsedData.body as RegBodyI
          const user = db.users.get(ws)

          if (!user) {
            userNotFound(ws, body, db)
            updateRoom(db)
            break;
          }

          if (user && user.password !== body.password) {
            invalidPassword(ws, user)
            break;
          }

          successLogin(ws, user)
          updateRoom(db)
          break;
        }
        case RESPONSE_TYPES.CREATE_ROOM: {
          createRoom(ws, db);
          updateRoom(db);
          break;
        }
        case RESPONSE_TYPES.ADD_USER_TO_ROOM: {
          const body = parsedData.body as AddUserToRoomBodyI
          addUserToRoom(ws, body, db);
          updateRoom(db);
          break;
        }
        case RESPONSE_TYPES.ADD_SHIPS: {
          const body = parsedData.body as AddShipsBodyI
          addShips(ws, body, db);
          break;
        }
      }
    })

    ws.on('close', () => {
      db.users.delete(ws)
    })
  })
}
