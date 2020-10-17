import { Schema } from 'shock-common'
import { createSelector } from 'reselect'

import { State } from '../../reducers'

import { getMyPublicKey } from './auth'

const getUsers = (state: State) => state.users
const getPublicKey = (_: State, props: string) => props

export const makeGetUser = () =>
  createSelector<State, string, State['users'], string, Schema.User>(
    getUsers,
    getPublicKey,
    (users, publicKey) => {
      const maybeUser = users[publicKey]

      if (maybeUser) {
        return users[publicKey]
      }

      return Schema.createEmptyUser(publicKey)
    },
  )

export const getAllOtherPublicKeys = createSelector<
  State,
  State['users'],
  string,
  string[]
>(
  getUsers,
  getMyPublicKey,
  (users, myPublicKey) => {
    return Object.keys(users).filter(publicKey => publicKey !== myPublicKey)
  },
)
