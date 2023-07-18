import { RawData, WebSocketServer } from 'ws'
import { db } from './db'
import { RESPONSE_TYPES } from './constants'
import { parseRawData } from './utils'
import { RegBodyI, AddUserToRoomBodyI, AddShipsBodyI } from './types'
import { updateRoom, createRoom, addUserToRoom } from './handlers/rooms'
import {
  userNotFound,
  invalidPassword,
  successLogin,
  updateWinners,
} from './handlers/users'
import { addShips } from './handlers/ships'

export const createWsServer = (port: number): void => {
  const wss = new WebSocketServer({ port })

  wss.on('connection', (ws) => {
    ws.on('error', console.error)

    ws.on('message', (rawData: RawData) => {
      console.log('received: %s', rawData)
      const parsedData = parseRawData(rawData)

      switch (parsedData.type) {
        case RESPONSE_TYPES.REG: {
          const body = parsedData.body as RegBodyI
          const user = db.users.get(ws)

          if (!user) {
            userNotFound(ws, body, db)
            updateRoom(db)
            updateWinners(db)
            break
          }

          if (user && user.password !== body.password) {
            invalidPassword(ws, user)
            break
          }

          successLogin(ws, user)
          updateRoom(db)
          updateWinners(db)
          break
        }
        case RESPONSE_TYPES.CREATE_ROOM: {
          createRoom(ws, db)
          updateRoom(db)
          break
        }
        case RESPONSE_TYPES.ADD_USER_TO_ROOM: {
          const body = parsedData.body as AddUserToRoomBodyI
          addUserToRoom(ws, body, db)
          updateRoom(db)
          break
        }
        case RESPONSE_TYPES.ADD_SHIPS: {
          const body = parsedData.body as AddShipsBodyI
          addShips(ws, body, db)
          break
        }
      }
    })

    ws.on('close', () => {
      db.users.delete(ws)
    })
  })
}
