const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server'); 
const User = require('../src/models/auth.user.js');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'testpassword'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User created successfully');
  });

  it('should not register a user with an existing username', async () => {
    await User.create({ username: 'testuser', password: 'testpassword' });
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'newpassword'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe('Username already exists');
  });

  it('should login a user and return a token', async () => {
    await User.create({ username: 'testuser', password: 'testpassword' });
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with incorrect credentials', async () => {
    await User.create({ username: 'testuser', password: 'testpassword' });
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword'
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toBe('Invalid username or password');
  });
});
