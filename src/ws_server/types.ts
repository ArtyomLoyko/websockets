export interface UserI {
  index: number
  name: string
  password: string
}

export interface RoomI {
  id: number
  users: { name: string; index: number }[]
}

export interface GameI {
  id: number
  users: [
    { userId: number, ships?: ShipI[] },
    { userId: number, ships?: ShipI[] },
  ]
}

export type BodyData = string | RegBodyI | AddUserToRoomBodyI | AddShipsBodyI

export interface RegBodyI {
  name: string
  password: string
}

export interface RegResponseI {
  name: string
  index: number
  error: boolean
  errorText: string
}

export interface AddUserToRoomBodyI {
  indexRoom: number
}

export interface CreateGameResponseI {
  idGame: number
  idPlayer: number
}

export type UpdateRoomResponseI = { roomId: number, roomUsers: { name: string, index: number }[] }[]

export interface Position {
  x: number,
  y: number
}

export type ShipTypes = "small"|"medium"|"large"|"huge"

export type AttackStatus = "miss"|"killed"|"shot"

export interface ShipI {
  position: Position,
  direction: boolean,
  length: number,
  type: ShipTypes
}

export interface AddShipsBodyI {
  gameId: number,
  indexPlayer: number,
  ships: ShipI[]
}

export interface StartGameResponseI {
  currentPlayerIndex: number,
  ships: ShipI[]
}
