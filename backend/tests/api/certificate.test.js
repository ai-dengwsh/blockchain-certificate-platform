const request = require('supertest');
const app = require('../../src/app');
const { User, Certificate } = require('../../src/models');
const { generateToken } = require('../../src/utils/jwt');

describe('Certificate API Tests', () => {
  let testUser, testCertificate, authToken;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      email: 'cert-test@example.com',
      password: 'Test123!@#',
      wallet_address: '0x1234567890123456789012345678901234567890',
      name: 'Cert Test User',
      status: 'active'
    });

    // Create test certificate
    testCertificate = await Certificate.create({
      token_id: '1',
      owner_address: testUser.wallet_address,
      title: 'Test Certificate',
      description: 'Test Description',
      image_url: 'https://example.com/image.jpg',
      metadata_url: 'https://example.com/metadata.json',
      status: 'active'
    });

    authToken = generateToken(testUser);
  });

  afterAll(async () => {
    await Certificate.destroy({ where: { token_id: '1' } });
    await User.destroy({ where: { email: 'cert-test@example.com' } });
  });

  describe('GET /api/certificates', () => {
    it('should return list of certificates', async () => {
      const res = await request(app)
        .get('/api/certificates')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter certificates by owner', async () => {
      const res = await request(app)
        .get('/api/certificates')
        .query({ owner: testUser.wallet_address })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].owner_address).toBe(testUser.wallet_address);
    });
  });

  describe('GET /api/certificates/:id', () => {
    it('should return certificate details', async () => {
      const res = await request(app)
        .get(`/api/certificates/${testCertificate.token_id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token_id', testCertificate.token_id);
      expect(res.body).toHaveProperty('title', testCertificate.title);
    });

    it('should return 404 for non-existent certificate', async () => {
      const res = await request(app)
        .get('/api/certificates/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/certificates', () => {
    it('should create new certificate', async () => {
      const newCertificate = {
        title: 'New Test Certificate',
        description: 'New Test Description',
        image_url: 'https://example.com/new-image.jpg',
        metadata_url: 'https://example.com/new-metadata.json'
      };

      const res = await request(app)
        .post('/api/certificates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCertificate);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('title', newCertificate.title);
      expect(res.body).toHaveProperty('owner_address', testUser.wallet_address);

      // Cleanup
      await Certificate.destroy({ where: { title: newCertificate.title } });
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/certificates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
