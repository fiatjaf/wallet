import Http from 'axios'
import { RSAKeychain } from 'react-native-rsa-native'

export const ACTIONS = {
  LOAD_NEW_KEYS: 'encryption/loadKeys',
}

/**
 * @typedef {object} DeviceKeyPair
 * @prop {string} publicKey
 */

/**
 * @typedef {object} ExchangedKeyPair
 * @prop {(string)=} devicePublicKey
 * @prop {(string)=} APIPublicKey
 * @prop {boolean} success
 */

/**
 * @typedef {object} ExchangeKeyPairParams
 * @prop {string} deviceId
 * @prop {string?} sessionId
 * @prop {string?} cachedSessionId
 * @prop {(string)=} baseURL
 */

/**
 * @typedef {object} PublicKey
 * @prop {string | undefined} public
 */

/**
 * Generates a keypair
 * @param {string} tag
 * @param {number} size
 * @param {number} retries
 * @returns {Promise<PublicKey>}
 */
const generateKey = async (tag, size = 2048, retries = 0) => {
  if (retries >= 5) {
    throw new Error('Unable to generate a key')
  }
  const keypairExists = await RSAKeychain.keyExists(tag)

  if (keypairExists) {
    return { public: await RSAKeychain.getPublicKey(tag) }
  }

  const keyPair = await RSAKeychain.generateKeys(tag, size)

  if (!keyPair.public) {
    return generateKey(tag, size, retries + 1)
  }

  return keyPair
}

/**
 * Generates and exchanges public keys with the API
 * @param {ExchangeKeyPairParams} deviceInfo
 * @returns {import('redux-thunk').ThunkAction<Promise<ExchangedKeyPair>, {}, {}, import('redux').AnyAction>}
 */
export const exchangeKeyPair = ({
  deviceId,
  sessionId,
  cachedSessionId,
  baseURL,
}) => async dispatch => {
  try {
    console.log({
      deviceId,
      sessionId,
      cachedSessionId,
    })
    const keyTag = `com.shocknet.APIKey.${sessionId}`
    const oldKeyTag = `com.shocknet.APIKey.${cachedSessionId}`
    const oldKeypair = await RSAKeychain.keyExists(oldKeyTag)
    console.log('Old Keypair:', oldKeypair)

    if (sessionId === cachedSessionId) {
      return {
        success: true,
      }
    }

    if (oldKeypair) {
      await RSAKeychain.deletePrivateKey(oldKeyTag)
    }

    console.log('Generating new key...')
    const keyPair = await generateKey(keyTag, 2048)
    console.log('New key generated')
    console.log('New Keypair', {
      publicKey: keyPair.public,
      deviceId,
    })
    const exchangedKeys = await Http.post(
      `${baseURL ? baseURL : ''}/api/security/exchangeKeys`,
      {
        publicKey: keyPair.public,
        deviceId,
      },
    )

    const data = {
      devicePublicKey: keyPair.public,
      APIPublicKey: exchangedKeys.data.APIPublicKey,
      sessionId: exchangedKeys.headers['x-session-id'],
      success: true,
    }

    dispatch({
      type: ACTIONS.LOAD_NEW_KEYS,
      data,
    })

    return data
  } catch (err) {
    console.warn(err)
    throw err
  }
}