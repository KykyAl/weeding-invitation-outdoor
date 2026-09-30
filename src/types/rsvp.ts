export type Attendance = 'attending' | 'not_attending'

export interface RsvpRequest {
  name: string
  attendance: Attendance
  guestCount: number
  message?: string
}

export interface RsvpResponse {
  id?: string
  name: string
  attendance: Attendance
  guestCount: number
  message?: string
  createdAt?: string
}
