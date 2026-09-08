// controllers/blogs.js
// Event handlers for /api/blogs routes.
// Uses express.Router() — a "mini app" for just these routes.

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

// GET /api/blogs → return all blogs

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({})
      .populate('user', { username: 1, name: 1, id: 1 })

    response.json(blogs)
  } catch (error) {
    next(error)
  }
})

// POST /api/blogs → create a new blog

blogsRouter.post('/', async (request, response, next) => {
  try {
    const user = await User.findOne({})

    if (!user) {
      return response.status(400).json({ error: 'User not found' })
    }

    const blog = new Blog({
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: request.body.likes || 0,
      user: user._id
    })

    // Save the blog
    const savedBlog = await blog.save()

    // Add the blog ID to the user's blogs array
    user.blogs = user.blogs.concat(savedBlog._id)

    // Save the updated user
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

// PUT /api/blogs/:id → update likes

blogsRouter.put('/:id', async (request, response, next) => {
  const { likes } = request.body

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { likes },
      { returnDocument: 'after', runValidators: true }
    )

    if (!updatedBlog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

// DELETE /api/blogs/:id → delete a blog by ID

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter