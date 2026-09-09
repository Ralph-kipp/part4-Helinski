const assert = require('node:assert')
const mongoose = require('mongoose')
const {connectDB, disconnectDB} = require('../controllers/mongo')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const { test, before, after, describe, beforeEach } = require('node:test')
const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')

const api = supertest(app)

let user
let user2
let token
let token2

const initialBlogs = [
{
title: 'First blog',
author: 'Test Author',
url: 'http://example.com/first',
likes: 5
},
{
title: 'Second blog',
author: 'Test Author',
url: 'http://example.com/second',
likes: 10
}
]

before(async () => {
await connectDB()
})

beforeEach(async () => {
await User.deleteMany({})
await Blog.deleteMany({})

// Create first user
const passwordHash = await bcrypt.hash('testpassword', 10)

user = new User({
username: 'testuser',
name: 'Test User',
passwordHash
})

await user.save()

// Create second user
const passwordHash2 = await bcrypt.hash('testpassword2', 10)

user2 = new User({
username: 'seconduser',
name: 'Second User',
passwordHash: passwordHash2
})

await user2.save()

// Seed blogs belonging to the first user
const blogObjects = initialBlogs.map(blog => ({
...blog,
user: user._id
}))

const savedBlogs = await Blog.insertMany(blogObjects)

user.blogs = savedBlogs.map(blog => blog._id)
await user.save()

// Login first user
const loginResponse = await api
.post('/api/login')
.send({
username: 'testuser',
password: 'testpassword'
})
.expect(200)

token = loginResponse.body.token

// Login second user
const loginResponse2 = await api
.post('/api/login')
.send({
username: 'seconduser',
password: 'testpassword2'
})
.expect(200)

token2 = loginResponse2.body.token
})

describe('Token-protected blog routes', () => {
test('GET /api/blogs works without a token', async () => {
const response = await api
.get('/api/blogs')
.expect(200)
assert.strictEqual(response.body.length, initialBlogs.length)

})

test('POST /api/blogs with a valid token creates a blog for the logged-in user', async () => {
const blogsBefore = await Blog.find({})
const response = await api
  .post('/api/blogs')
  .set('Authorization', `Bearer ${token}`)
  .send({
    title: 'New Blog',
    author: 'Test Author',
    url: 'http://example.com/new',
    likes: 3
  })
  .expect(201)

const blogsAfter = await Blog.find({})

assert.strictEqual(
  blogsAfter.length,
  blogsBefore.length + 1
)

assert.strictEqual(
  response.body.user.toString(),
  user._id.toString()
)
})

test('POST /api/blogs without Authorization header returns 401 and does not create a blog', async () => {
const blogsBefore = await Blog.find({})
await api
  .post('/api/blogs')
  .send({
    title: 'Unauthorized Blog',
    author: 'Nobody',
    url: 'http://example.com/nope',
    likes: 0
  })
  .expect(401)

const blogsAfter = await Blog.find({})

assert.strictEqual(
  blogsAfter.length,
  blogsBefore.length
)
})

test('POST /api/blogs with a garbage token returns 401 and does not create a blog', async () => {
const blogsBefore = await Blog.find({})
await api
  .post('/api/blogs')
  .set('Authorization', 'Bearer notarealtoken')
  .send({
    title: 'Garbage Token Blog',
    author: 'Nobody',
    url: 'http://example.com/nope',
    likes: 0
  })
  .expect(401)

const blogsAfter = await Blog.find({})

assert.strictEqual(
  blogsAfter.length,
  blogsBefore.length
)

})

test('new blog ID is added to the users blogs array', async () => {
const response = await api
.post('/api/blogs')
.set('Authorization', `Bearer ${token}`)
.send({
title: 'Another Blog',
author: 'Test Author',
url: 'http://example.com/another',
likes: 1
})
.expect(201)
const updatedUser = await User.findById(user._id)

const blogIds = updatedUser.blogs.map(id => id.toString())

assert(
  blogIds.includes(response.body.id || response.body._id.toString())
)
})

test('owner can delete their own blog', async () => {
const blog = await Blog.findOne({ user: user._id })
await api
  .delete(`/api/blogs/${blog._id}`)
  .set('Authorization', `Bearer ${token}`)
  .expect(204)

const blogsAfter = await Blog.find({})

assert.strictEqual(
  blogsAfter.some(
    b => b._id.toString() === blog._id.toString()
  ),
  false
)

})

test('deleting a blog removes its ID from the users blogs array', async () => {
const blog = await Blog.findOne({ user: user._id })
await api
  .delete(`/api/blogs/${blog._id}`)
  .set('Authorization', `Bearer ${token}`)
  .expect(204)

const updatedUser = await User.findById(user._id)

const blogIds = updatedUser.blogs.map(id => id.toString())

assert.strictEqual(
  blogIds.includes(blog._id.toString()),
  false
)
})

test('another user cannot delete someone elses blog', async () => {
const blog = await Blog.findOne({ user: user._id })
await api
  .delete(`/api/blogs/${blog._id}`)
  .set('Authorization', `Bearer ${token2}`)
  .expect(403)

const blogStillExists = await Blog.findById(blog._id)

assert.notStrictEqual(blogStillExists, null)

})

test('deleting a nonexistent blog returns 404', async () => {
const nonexistentId = new mongoose.Types.ObjectId()
await api
  .delete(`/api/blogs/${nonexistentId}`)
  .set('Authorization', `Bearer ${token}`)
  .expect(404)

})

test('deleting a blog without a token returns 401', async () => {
const blog = await Blog.findOne({ user: user._id })
await api
  .delete(`/api/blogs/${blog._id}`)
  .expect(401)

const blogStillExists = await Blog.findById(blog._id)

assert.notStrictEqual(blogStillExists, null)

})
})

after(async () => {
await disconnectDB()
})
