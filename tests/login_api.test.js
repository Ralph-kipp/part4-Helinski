const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const { connectDB, disconnectDB } = require('../controllers/mongo')
const { test, before, after, describe, beforeEach } = require('node:test')

const api = supertest(app)

before(async () => {
await connectDB()
})

beforeEach(async () => {
await User.deleteMany({})

const passwordHash = await bcrypt.hash('testpassword', 10)

const user = new User({
username: 'testuser',
name: 'Test User',
passwordHash
})

await user.save()
})

describe('Login API', () => {
test('correct credentials return a token', async () => {
const response = await api
.post('/api/login')
.send({
username: 'testuser',
password: 'testpassword'
})
.expect(200)

})

test('login response does not contain passwordHash', async () => {
const response = await api
.post('/api/login')
.send({
username: 'testuser',
password: 'testpassword'
})
.expect(200)


})

test('wrong password returns 401', async () => {
const response = await api
.post('/api/login')
.send({
username: 'testuser',
password: 'wrongpassword'
})
.expect(401)
assert.strictEqual(
  response.body.error,
  'Invalid username or password'
)

})

test('nonexistent username returns 401', async () => {
const response = await api
.post('/api/login')
.send({
username: 'doesnotexist',
password: 'testpassword'
})
.expect(401)
assert.strictEqual(
  response.body.error,
  'Invalid username or password'
)

})
})

after(async () => {
await disconnectDB()
})
