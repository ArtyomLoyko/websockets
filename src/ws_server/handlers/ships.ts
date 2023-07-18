import { WebSocket } from 'ws';
import { DB } from '../db'
import { RESPONSE_TYPES } from '../constants'
import { toResponse } from '../utils'
import { AddShipsBodyI, StartGameResponseI } from '../types'

export const addShips = (ws: WebSocket, body: AddShipsBodyI, db: DB) => {
  const game = db.games[body.gameId]
  game.users[body.indexPlayer].ships = body.ships

  if (game.users.every(u => u.ships)) {
    const secondUserId = body.indexPlayer === 1 ? 0 : 1
    const secondUserWs = db.findUserKeyByIndex(secondUserId)
    const response = toResponse<StartGameResponseI>(
      RESPONSE_TYPES.START_GAME, 
      {
        ships: body.ships,
        currentPlayerIndex: body.indexPlayer
      }
    )
    ws.send(response)
    if (secondUserWs) secondUserWs.send(response)
  }
}