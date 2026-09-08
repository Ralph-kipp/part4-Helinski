const supertest = require('supertest')
const app = require('../app')
const {connectDB, disconnectDB} = require('../controllers/mongo')
const { test, before, after, describe, beforeEach } = require('node:test')
const User = require('../models/user')
const assert = require('assert')

const api = supertest(app)

before(async () => {
  await connectDB()
})

describe('Initial operations test for Users API', async () => {
    beforeEach(async () => {
        await api.delete('/api/users')

    })
    const usersBefore = await api.get('/api/users')
    test('POST /api/users creates a new user', async () => {
        const newUser = {
            username: "testuser",
            name: "Test User",
            password: "testpassword"
        }
        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAfter = await api.get('/api/users')
        assert.strictEqual(usersAfter.body.length, usersBefore.body.length + 1)
    })

    test('GET /api/users returns all users', async () => {
        const newUser = {
            username: "testuser",
            name: "Test User",
            password: "testpassword"
        }
        await api.post('/api/users').send(newUser)

        const response = await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.length, usersBefore.body.length + 1)
    })

    test('POST /api/users with short password returns 400', async () => {
        const newUser = {
            username: "testuser",
            name: "Test User",
            password: "pw"
        }   

        try {
            const response = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            assert.strictEqual(response.body.error, 'password must be at least 3 characters long')
        } catch (error) {
            next(error)
        }
})


after(async () => {
  await disconnectDB()
})

})
