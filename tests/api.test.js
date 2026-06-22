const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Task = require('../src/models/Task');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Task.deleteMany({});
});

describe('TaskFlow API Tests', () => {

  // 1. Test unitaire : GET /health retourne status 200 et {status:'ok'}
  it('should return 200 and status ok on GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  // 2. Test unitaire : POST /api/tasks avec un title vide retourne une erreur 400
  it('should return 400 when creating a task with empty title on POST /api/tasks', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  // 3. Test unitaire : GET /api/tasks retourne un tableau (même vide)
  it('should return an array on GET /api/tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 4. Test d'intégration : créer une tâche puis la récupérer par son id
  it('should create a task and retrieve it by id', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test Task', description: 'Testing integration' });
    
    expect(createRes.statusCode).toBe(201);
    expect(createRes.body._id).toBeDefined();
    
    const taskId = createRes.body._id;
    
    const getRes = await request(app).get(`/api/tasks/${taskId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body._id).toBe(taskId);
    expect(getRes.body.title).toBe('Test Task');
  });

});
