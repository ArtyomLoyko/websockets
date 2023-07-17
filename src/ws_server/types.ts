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
    { userId: number },
    { userId: number },
  ]
}

export interface ResponseI {
  type: string
  data: string
  id: number
}

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
