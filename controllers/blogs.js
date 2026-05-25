// controllers/blogs.js
// Event handlers for /api/blogs routes.
// Uses express.Router() — a "mini app" for just these routes.

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const {await, async} = require('node:test')

// GET /api/blogs → return all blogs
blogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog.find({})
    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

// POST /api/blogs → create a new blog
blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  try {
    const result = await blog.save()
    response.status(201).json(result)
  } catch (error) {
    next(error)
  }})

blogsRouter.post('/', async (request, response, next) => {
  try {
    const blog = new Blog(request.body)
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})


//DELETE /api/blogs/:id → delete a blog by ID

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})


module.exports = blogsRouter