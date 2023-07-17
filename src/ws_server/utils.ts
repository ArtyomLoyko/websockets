import { RawData } from "ws"

export const toResponse = <DataType>(type: string, data: DataType): string => JSON.stringify({
  type,
  data: JSON.stringify(data),
  id: 0
})

export const parseRawData = <DataType>(rawData: RawData): { type: string, body: DataType }  => {
  const parsedRawData = JSON.parse(rawData.toString())
  return {
    type: parsedRawData.type,
    body: parsedRawData.data ? JSON.parse(parsedRawData.data) : ''
  }
}