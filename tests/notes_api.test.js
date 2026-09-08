const { test,before, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const {connectDB, disconnectDB} = require('../controllers/mongo')

const api = supertest(app)


test('notes are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    console.info(response.body)
})

after(async () => {
  await mongoose.connection.close()
})