import request from 'supertest';
import app from '../../src/app';

describe('Leave Management API Tests', () => {
  it('should create a leave request', async () => {
    const response = await request(app)
      .post('/api/leaves')
      .send({
        employeeId: 1,
        leaveType: 'Vacation',
        startDate: '2023-05-01',
        endDate: '2023-05-10'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should fetch leave requests for an employee', async () => {
    const response = await request(app)
      .get('/api/leaves/1');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should update a leave request', async () => {
    const response = await request(app)
      .put('/api/leaves/1')
      .send({
        endDate: '2023-05-15'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Leave updated successfully.');
  });

  it('should delete a leave request', async () => {
    const response = await request(app)
      .delete('/api/leaves/1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Leave deleted successfully.');
  });
});
