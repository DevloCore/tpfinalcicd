const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/Task');

// Mock Mongoose Task Model
jest.mock('../src/models/Task', () => {
  let mockTasks = [];
  return class TaskMock {
    constructor(data) {
      Object.assign(this, data);
    }
    save() {
      if (this.title === 'trigger-error') return Promise.reject(new Error('DB Error'));
      const task = { _id: 'mockedId123', ...this };
      mockTasks.push(task);
      return Promise.resolve(task);
    }
    static find = jest.fn(() => Promise.resolve(mockTasks));
    static findById = jest.fn((id) => {
      if (id === 'error') return Promise.reject(new Error('DB Error'));
      return Promise.resolve(mockTasks.find(t => t._id === id));
    });
    static findByIdAndUpdate = jest.fn((id, update) => {
      if (id === 'error') return Promise.reject(new Error('DB Error'));
      const task = mockTasks.find(t => t._id === id);
      if (task) {
        Object.assign(task, update);
        return Promise.resolve(task);
      }
      return Promise.resolve(null);
    });
    static findByIdAndDelete = jest.fn((id) => {
      if (id === 'error') return Promise.reject(new Error('DB Error'));
      const index = mockTasks.findIndex(t => t._id === id);
      if (index > -1) {
        const task = mockTasks[index];
        mockTasks.splice(index, 1);
        return Promise.resolve(task);
      }
      return Promise.resolve(null);
    });
    static deleteMany = jest.fn(() => {
      mockTasks = [];
      return Promise.resolve();
    });
    
    static setFindToThrow = () => {
      this.find = jest.fn(() => Promise.reject(new Error('DB Error')));
    };
    static resetFind = () => {
      this.find = jest.fn(() => Promise.resolve(mockTasks));
    };
  };
});

afterEach(async () => {
  await Task.deleteMany({});
  if (Task.resetFind) Task.resetFind();
});

describe('TaskFlow API Tests', () => {

  it('should return 200 and status ok on GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should return an array on GET /api/tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
  });
  
  it('should return 500 on GET /api/tasks if db fails', async () => {
    Task.setFindToThrow();
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(500);
  });

  it('should return 400 when creating a task with empty title', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '' });
    expect(res.statusCode).toBe(400);
  });

  it('should create a task', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Test' });
    expect(res.statusCode).toBe(201);
  });

  it('should return 500 on POST /api/tasks if db fails', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'trigger-error' });
    expect(res.statusCode).toBe(500);
  });

  it('should return 404 for unknown task', async () => {
    const res = await request(app).get('/api/tasks/unknown');
    expect(res.statusCode).toBe(404);
  });

  it('should retrieve a task by id', async () => {
    await request(app).post('/api/tasks').send({ title: 'Test' });
    const res = await request(app).get('/api/tasks/mockedId123');
    expect(res.statusCode).toBe(200);
  });

  it('should return 500 on GET /api/tasks/:id if db fails', async () => {
    const res = await request(app).get('/api/tasks/error');
    expect(res.statusCode).toBe(500);
  });

  it('should return 404 on PUT unknown task', async () => {
    const res = await request(app).put('/api/tasks/unknown').send({ status: 'done' });
    expect(res.statusCode).toBe(404);
  });

  it('should update a task', async () => {
    await request(app).post('/api/tasks').send({ title: 'Test' });
    const res = await request(app).put('/api/tasks/mockedId123').send({ status: 'done' });
    expect(res.statusCode).toBe(200);
  });

  it('should return 500 on PUT /api/tasks/:id if db fails', async () => {
    const res = await request(app).put('/api/tasks/error').send({ status: 'done' });
    expect(res.statusCode).toBe(500);
  });

  it('should return 404 on DELETE unknown task', async () => {
    const res = await request(app).delete('/api/tasks/unknown');
    expect(res.statusCode).toBe(404);
  });

  it('should delete a task', async () => {
    await request(app).post('/api/tasks').send({ title: 'Test' });
    const res = await request(app).delete('/api/tasks/mockedId123');
    expect(res.statusCode).toBe(200);
  });

  it('should return 500 on DELETE /api/tasks/:id if db fails', async () => {
    const res = await request(app).delete('/api/tasks/error');
    expect(res.statusCode).toBe(500);
  });
});
