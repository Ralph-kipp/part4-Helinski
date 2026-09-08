const supertest = require('supertest')
const app = require('../app')
const {connectDB, disconnectDB} = require('../controllers/mongo')
const { test, before, after, describe, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const assert = require('assert')

const api = supertest(app)

before(async () => {
  await connectDB()
})


describe('Notes API', () => {

    let initialBlogs = [
                {
                    title: "Test Blog 1",  
                    author: "Test Author 1",
                    url: "https://www.testblog1.com",
                    likes: 5},
                {
                    title: "Test Blog 2",  
                    author: "Test Author 2",
                    url: "https://www.testblog2.com",
                    likes: 10},
                {
                    title: "Test Blog 3",
                    author: "Test Author 3",
                    url: "https://www.testblog3.com",
                    likes: 15}
            ]

           beforeEach(async () => { 
            await Blog.deleteMany({})
            await Blog.insertMany(initialBlogs)
        })

    const newBlog = {
        title: "Test Blog",
        author: "Test Author",
        url: "https://www.testblog.com",
    }
    test('GET /api/blogs returns all blogs', async () => {
        const response = await api        
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        assert.strictEqual(response.body.length, initialBlogs.length, `Expected ${initialBlogs.length} blogs but got ${response.body.length}`)
        

    })

    test('GET api/blogs and converting internal _id to id', async () => {  
        const response = await api
        .get('/api/blogs')
        .expect(200)
        console.log('Response body with id:', response.body)
        const blog = response.body[0]
        assert.notStrictEqual(blog.id,undefined, 'Expected blog to have an id property')
        assert.strictEqual(blog._id, undefined)
    })

    test('POST /api/blogs assumes likes is 0 if missing', async () => {
        const response = await api
            .post('/api/blogs')
            .send(newBlog) // Ensure likes is set to 0 if missing, should auto-add likes in backend not in test.
            .expect(201)
            .expect('Content-Type', /application\/json/)
            console.log('Response body:', response.body)

        const response2 = await api.get('/api/blogs')
        .expect(200)
        assert.strictEqual(response2.body.length, initialBlogs.length + 1, `Expected ${initialBlogs.length + 1} blogs but got ${response2.body.length}`)

        const lastblog = 
        response2.body.find(b => b.title === newBlog.title && b.author === newBlog.author && b.url === newBlog.url)
        assert.strictEqual(lastblog.likes, 0)
    })

    test('POST /api/blogs without title and url returns 400 Bad Request', async () => {
        const invalidBlog = {
            author: "Invalid Author",
            likes: 5,
            url: "https://www.invalidblog.com"
        }   

       const response = await api
            .post('/api/blogs')
            .send(invalidBlog)
            .expect(400)
            console.log('Response body for invalid blog:', response.body)
    })

    test('DELETE /api/blogs/:id deletes a blog', async () => {
        const response = await api.get('/api/blogs')
        .expect(200)
        console.log('Blogs before deletion:', response.body)


        const blogToDelete = response.body[0]
        await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)


        const response2 = await api.get('/api/blogs')
        .expect(200)
        assert.strictEqual(response2.body.length, initialBlogs.length-1, `Expected ${initialBlogs.length-1} blogs but got ${response2.body.length}`)
    })

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
    
    test('notes are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    console.info(response.body)
})})

describe('Tests after correcting and completing part 4 C & D', () => {
    test("Updating blog likes", async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToUpdate = blogsAtStart.body[0]
        const updatedblog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }

        const response = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedblog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.likes, blogToUpdate.likes + 1, `Expected likes to be ${blogToUpdate.likes + 1} but got ${response.body.likes}`)
    })
}
)

after(async () => {
  await disconnectDB()
})
//     const id = 0
//     const response = test('GET /api/blogs returns json', async () => {
//         await api
//         .get('/api/blogs')
//         .expect(200)
//         .expect('Content-Type', /application\/json/)
//         id = response.body[0].id
//     })


//     test('DELETE /api/blogs/:id deletes a blog', async () => {
//         await api
//         .delete(`/api/blogs/${id}`) // Replace with an actual blog ID
//         .expect(204)
//     })

//     test('POST /api/blogs creates a new blog', async () => {
//         const newBlog = {
//             title: "Test Blog",
//             author: "Test Author",
//             url: "https://www.testblog.com",
//             likes: 0
//         }

//         if(newBlog.likes){ 
//             console.info(newBlog)       
//             await api
//             .post('/api/blogs')
//             .send(newBlog)
//             .expect(201)
//             .expect('Content-Type', /application\/json/)}
//             else{
//                 await api
//                 .post('/api/blogs')
//                 .send(newBlog)
//                 .expect(400)
//             }
//     })


