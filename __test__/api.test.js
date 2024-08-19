const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/auth.user');
const AnalyticalData = require('../src/models/analyticalData');
const UptimeData = require('../src/models/uptimeData');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const user = await User.create({ username: 'testuser', password: 'testpassword' });
  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await AnalyticalData.deleteMany({});
  await UptimeData.deleteMany({});
});

describe('API Endpoints', () => {
  it('should get analytical data', async () => {
    // Insert some test data
    await AnalyticalData.create([
      { timestamp: new Date(), data: 1 },
      { timestamp: new Date(), data: 0 }
    ]);

    const res = await request(app)
      .get('/api/analytical-data')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get uptime data', async () => {
    // Insert some test data
    await UptimeData.create([
      { timestamp: new Date(), status: 'connected' },
      { timestamp: new Date(), status: 'disconnected' }
    ]);

    const res = await request(app)
      .get('/api/uptime-data')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get overall report', async () => {
    // Insert some test data
    await AnalyticalData.create([
      { timestamp: new Date(), data: 1 },
      { timestamp: new Date(), data: 0 }
    ]);
    await UptimeData.create([
      { timestamp: new Date(), status: 'connected' },
      { timestamp: new Date(), status: 'disconnected' }
    ]);

    const res = await request(app)
      .get('/api/overall-report')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('analyticalSummary');
    expect(res.body).toHaveProperty('busiestDays');
    expect(res.body).toHaveProperty('quietestDays');
    expect(res.body).toHaveProperty('uptimeSummary');
  });

  it('should not allow access without a token', async () => {
    const res = await request(app).get('/api/analytical-data');

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toBe('Please authenticate');
  });
});