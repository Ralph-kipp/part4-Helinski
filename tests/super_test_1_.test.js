const supertest = require('supertest')
const { test,before, after } = require('node:test')
const mongoose = require('mongoose')
const app = require('../app')
const {connectDB, disconnectDB} = require('../controllers/mongo')

//wrapper for supertest on app.js
const api = supertest(app)

const newBlog = {
    title: "Reinnassance Art",
  author: "Lakson D First",
  url: "https://www.renaissanceart.com",
  likes: 0,
}


test('supertest: blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    console.log('test is running')
})

test('supertest: blogs are returned as json - test 2', async () => {
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
})   

after (async () => {
    mongoose.connection.close()
  console.log('after test')
})
