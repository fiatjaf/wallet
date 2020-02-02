import React from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '../../res/css'

/**
 * @typedef {object} Props
 * @prop {(object)=} style
 * @prop {string} value
 * @prop {any} onPress
 */

/**
 * @param {Props} Props
 */
const Footer = ({ style = {}, value, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.modalFooter, style]}>
      <Text style={styles.modalFooterText}>{value}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  modalFooter: {
    height: '14%',
    width: '100%',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.GOLD,
  },
  modalFooterText: {
    fontFamily: 'Montserrat-700',
    color: Colors.TEXT_WHITE,
  },
})

export default Footer
