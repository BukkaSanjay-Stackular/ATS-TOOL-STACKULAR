import type { User } from '../types'

export const USERS: User[] = [
  { id: 1, username: 'Amulya', password: 'amulya@hr-stack', role: 'recruitment', name: 'Amulya' },
  { id: 2, username: 'Sai Kalyan', password: 'kalyan@manager-stack', role: 'recruitment', name: 'Sai Kalyan' },
  { id: 3, username: 'Venkat', password: 'venkat@ceo-stack', role: 'recruitment', name: 'Venkat' },
  { id: 4, username: 'Karthik', password: 'karthik@dev-stack', role: 'interviewer', name: 'Karthik' },
  { id: 5, username: 'Fardeen', password: 'fardeen@dev-stack', role: 'interviewer', name: 'Fardeen' },
  { id: 6, username: 'Jay', password: 'jay@engineer-stack', role: 'interviewer', name: 'Jay' },
  { id: 7, username: 'Nadem', password: 'nadeem@engineer-stack', role: 'interviewer', name: 'Nadem' },
  { id: 8, username: 'Javeed', password: 'Javeed@design-stack', role: 'interviewer', name: 'Javeed' },
]

export const INTERVIEWERS = USERS.filter(u => u.role === 'interviewer')
