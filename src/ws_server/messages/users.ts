import { WebSocket } from 'ws';
import { DB } from '../db'
import { RESPONSE_TYPES, ERROR_MESSAGES } from './../constants'
import { toResponse } from './../utils'
import { RegBodyI, RegResponseI, UserI } from './../types'

export const userNotFound = (ws: WebSocket, body: RegBodyI, db: DB) => {
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
}

export const invalidPassword = (ws: WebSocket, user: UserI) => {
  const data: RegResponseI = {
    name: user.name,
    index: user.index,
    error: true,
    errorText: ERROR_MESSAGES.INVALID_PASSWORD,
  }
  const response = toResponse<RegResponseI>(RESPONSE_TYPES.REG, data)
  ws.send(response)
}

export const successLogin = (ws: WebSocket, user: UserI) => {
  const data: RegResponseI = {
    name: user.name,
    index: user.index,
    error: false,
    errorText: '',
  }
  const response = toResponse<RegResponseI>(RESPONSE_TYPES.REG, data)
  ws.send(response)
}