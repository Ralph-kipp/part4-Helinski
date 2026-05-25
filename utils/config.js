require('dotenv').config()

console.log('🔥 CONFIG MODULE LOADED')
console.log('RAW ENV:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI
})

const NODE_ENV = process.env.NODE_ENV

const MONGODB_URI =
  NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

console.log('SELECTED MODE:', NODE_ENV)
console.log('FINAL MONGODB_URI:', MONGODB_URI)

module.exports = {
  MONGODB_URI
}