// Serialized notice shape returned by the API and consumed by the client.
// Dates are ISO strings so they survive JSON serialization / SSR props.
export type SerializedNotice = {
  id: number
  title: string
  content: string
  isUrgent: boolean
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}
