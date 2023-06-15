const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const userService = require('../services/user.service');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const axios = require("axios");

describe('User Controller', () => {
  describe('POST /api/users/signup', () => {
    it('should return a success message when a user is successfully registered', async () => {
      // Stub the userService.create method
      const createStub = sinon.stub(userService, 'create').resolves();

      // Send a POST request to the /api/signup route
      const res = await request(app)
        .post('/api/users/signup')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password',
          address: '123 Street',
          phoneNumber: '1234567890',
          image: 'someImageurl',
          age: 25,
        });

      // Assertions
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.deep.equal({ message: 'User registered successfully!' });
      expect(createStub.calledOnce).to.be.true;

      // Restore the stubbed method
      createStub.restore();
    });

    it('should return an error message when required fields are missing', async () => {
      // Send a POST request to the /api/signup route without required fields
      const res = await request(app)
        .post('/api/users/signup')
        .send({
          name: 'John Doe',
          // Missing other required fields
        });

      // Assertions
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.deep.equal({ message: 'Name, email, password, address, phoneNumber, and age are required!' });
    });

    it('should call console.log when there is an error in get function of axios', async () => {
      // Stub the userService.create method
      const createStub = sinon.stub(userService, 'create').resolves();
      const axiosGetStub = sinon.stub(axios, 'get').throws(new Error(null));
      const consoleLogSpy = sinon.spy(console, 'log');

      // Send a POST request to the /api/signup route
      const res = await request(app)
        .post('/api/users/signup')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password',
          address: '123 Street',
          phoneNumber: '1234567890',
          image: 'someImageurl',
          age: 25,
        });

      // Assertions
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.deep.equal({ message: 'User registered successfully!' });
      expect(createStub.calledOnce).to.be.true;
      expect(axiosGetStub.calledOnce).to.be.true;
      expect(consoleLogSpy.calledOnce).to.be.true;

      // Restore the stubbed method
      createStub.restore();
      axiosGetStub.restore();
      consoleLogSpy.restore();
    });

    it('should return a 500 status if there is an error with the create function in the userservice file', async () => {
      // Stub the userService.create method
      const createStub = sinon.stub(userService, 'create').throws(new Error(null));

      // Send a POST request to the /api/signup route
      const res = await request(app)
        .post('/api/users/signup')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password',
          address: '123 Street',
          phoneNumber: '1234567890',
          image: 'someImageurl',
          age: 25,
        });

      // Assertions
      expect(res.statusCode).to.equal(500);
      expect(res.body).to.deep.equal({ message: 'null' });
      expect(createStub.calledOnce).to.be.true;

      // Restore the stubbed method
      createStub.restore();
    });

    // Add more test cases for other scenarios
  });

  describe('POST /api/users/login', () => {
    it('should return a token when a user is successfully logged', async () => {
      // Stub the userService.create method
      const findStub = sinon.stub(userService, 'findByEmail').returns({
        password: 'password'
      });

      const bcryptStub = sinon.stub(bcrypt, 'compare').returns(true);

      // Send a POST request to the /api/signup route
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'john@example.com',
          password: 'password'
        });

      // Assertions
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('token').and.to.be.a('string'); // Expect a token to be present and it should be a string
      expect(findStub.calledOnce).to.be.true;
      expect(bcryptStub.calledOnce).to.be.true;

      // Restore the stubbed method
      findStub.restore();
      bcryptStub.restore();
    });

    it('should return an error message when required fields are missing', async () => {
      // Send a POST request to the /api/signup route without required fields
      const res = await request(app)
        .post('/api/users/login')
        .send({
          name: 'John Doe',
          // Missing other required fields
        });

      // Assertions
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.deep.equal({ message: 'Email and password are required!' });
    });

    it('should return a 404 status if user is not found', async () => {
      // Stub the userService.create method
      const findStub = sinon.stub(userService, 'findByEmail').returns(false);

      // Send a POST request to the /api/signup route
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'john@example.com',
          password: 'password'
        });

      // Assertions
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.deep.equal({message: "User not found!"}); // Expect a token to be present and it should be a string
      expect(findStub.calledOnce).to.be.true;

      // Restore the stubbed method
      findStub.restore();
    });

    it('should return 401 status if password is invalid', async () => {
      // Stub the userService.create method
      const findStub = sinon.stub(userService, 'findByEmail').returns({
        password: 'password'
      });

      const bcryptStub = sinon.stub(bcrypt, 'compare').returns(false);

      // Send a POST request to the /api/signup route
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'john@example.com',
          password: 'password'
        });

      // Assertions
      expect(res.statusCode).to.equal(401);
      expect(res.body).to.deep.equal({message: "Invalid password!"}); // Expect a token to be present and it should be a string
      expect(findStub.calledOnce).to.be.true;
      expect(bcryptStub.calledOnce).to.be.true;

      // Restore the stubbed method
      findStub.restore();
      bcryptStub.restore();
    });

    it('should return 500 status if an error occurs', async () => {
      // Stub the userService.create method
      const findStub = sinon.stub(userService, 'findByEmail').throws(new Error(null));

      // Send a POST request to the /api/signup route
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'john@example.com',
          password: 'password'
        });

      // Assertions
      expect(res.statusCode).to.equal(500);
      expect(res.body).to.deep.equal({message: "Error retrieving User with email: john@example.com"}); // Expect a token to be present and it should be a string
      expect(findStub.calledOnce).to.be.true;

      // Restore the stubbed method
      findStub.restore();
    });

    // Add more test cases for other scenarios
  });

  describe('POST /api/users', () => {
    it('should post one user', async () => {
      // Stub the userService.create method
      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      const createStub = sinon.stub(userService, 'create').resolves();

      // Send a POST request to the /api/signup route
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password',
          address: '123 Street',
          phoneNumber: '1234567890',
          image: 'someImageurl',
          age: 25,
        })
        .set('Authorization', authorizationHeader);

      // Assertions
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.deep.to.equal({}); // Expect a token to be present and it should be a string
      expect(verifyStub.calledOnce).to.be.true;
      expect(createStub.calledOnce).to.be.true;

      // Restore the stubbed method
      verifyStub.restore();
      createStub.restore();
    });

    it('should not be able to post one user because information is incomplete', async () => {
      // Stub the userService.create method
      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      const createStub = sinon.stub(userService, 'create').resolves();

      // Send a POST request to the /api/signup route
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe',
        })
        .set('Authorization', authorizationHeader);

      // Assertions
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.deep.to.equal({message: "Content can not be empty!"}); // Expect a token to be present and it should be a string
      expect(verifyStub.calledOnce).to.be.true;
      expect(createStub.notCalled).to.be.true;

      // Restore the stubbed method
      verifyStub.restore();
      createStub.restore();
    });

    it('should send 500 status if an error occurs.', async () => {
      // Stub the userService.create method
      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      const createStub = sinon.stub(userService, 'create').throws(new Error(null));

      // Send a POST request to the /api/signup route
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password',
          address: '123 Street',
          phoneNumber: '1234567890',
          image: 'someImageurl',
          age: 25,
        })
        .set('Authorization', authorizationHeader);

      // Assertions
      expect(res.statusCode).to.equal(500);
      expect(res.body).to.deep.to.equal({message: "null"}); // Expect a token to be present and it should be a string
      expect(verifyStub.calledOnce).to.be.true;
      expect(createStub.calledOnce).to.be.true;

      // Restore the stubbed method
      verifyStub.restore();
      createStub.restore();
    });

    // Add more test cases for other scenarios
  });

  describe('GET /api/users', () => {
    it('should return a list of users', async () => {
      // Stub the userService.create method
      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      const findAllStub = sinon.stub(userService, 'findAll').returns([]);

      // Send a POST request to the /api/signup route
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', authorizationHeader);

      // Assertions
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.deep.to.equal([]); // Expect a token to be present and it should be a string
      expect(verifyStub.calledOnce).to.be.true;
      expect(findAllStub.calledOnce).to.be.true;

      // Restore the stubbed method
      verifyStub.restore();
      findAllStub.restore();
    });

    it('should return an error if users cannot be retrieved', async () => {
      // Send a POST request to the /api/signup route without required fields
      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      const findAllStub = sinon.stub(userService, 'findAll').throws(new Error(null));
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', authorizationHeader);

      // Assertions
      expect(res.statusCode).to.equal(500);
      expect(res.body).to.deep.equal({ message: 'null' }); // Expect a token to be present and it should be a string
      expect(verifyStub.calledOnce).to.be.true;
      expect(findAllStub.calledOnce).to.be.true;

      // Restore the stubbed method
      verifyStub.restore();
      findAllStub.restore();
    });

    // Add more test cases for other scenarios
  });

  describe('GET /api/users/:id', () => {
    it('should return a specific user', async () => {
      const mockUserId = 'user123'; // Mocked user ID

      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      // Stub the userService.findById method
      const findByIdStub = sinon.stub(userService, 'findById').returns({
        id: mockUserId,
        name: 'John Doe',
        email: 'john@example.com',
      });
  
      // Send a GET request to the /api/users/:id route with the mocked user ID
      const res = await request(app)
        .get(`/api/users/${mockUserId}`)
        .set('Authorization', authorizationHeader);
  
      // Assertions
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.deep.equal({
        id: mockUserId,
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(findByIdStub.calledOnceWith(mockUserId)).to.be.true;
      expect(verifyStub.calledOnce).to.be.true;
  
      // Restore the stubbed method
      findByIdStub.restore();
      verifyStub.restore();
    });

    it('should return a specific user', async () => {
      const mockUserId = 'user123'; // Mocked user ID

      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      // Stub the userService.findById method
      const findByIdStub = sinon.stub(userService, 'findById').throws(new Error(null));
  
      // Send a GET request to the /api/users/:id route with the mocked user ID
      const res = await request(app)
        .get(`/api/users/${mockUserId}`)
        .set('Authorization', authorizationHeader);
  
      // Assertions
      expect(res.statusCode).to.equal(500);
      expect(res.body).to.deep.equal({message: "Error retrieving User with id=user123"});
      expect(findByIdStub.calledOnceWith(mockUserId)).to.be.true;
      expect(verifyStub.calledOnce).to.be.true;
  
      // Restore the stubbed method
      findByIdStub.restore();
      verifyStub.restore();
    });
  
    it('should return a specific user', async () => {
      const mockUserId = 'user123'; // Mocked user ID

      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      // Stub the userService.findById method
      const findByIdStub = sinon.stub(userService, 'findById').returns(false);
  
      // Send a GET request to the /api/users/:id route with the mocked user ID
      const res = await request(app)
        .get(`/api/users/${mockUserId}`)
        .set('Authorization', authorizationHeader);
  
      // Assertions
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.deep.equal({message: "Cannot find User with id=user123."});
      expect(findByIdStub.calledOnceWith(mockUserId)).to.be.true;
      expect(verifyStub.calledOnce).to.be.true;
  
      // Restore the stubbed method
      findByIdStub.restore();
      verifyStub.restore();
    });
    // ... add more test cases
  });

  describe('PUT /api/users/:id', () => {
    it('should update a specific user', async () => {
      const mockUserId = 'user123'; // Mocked user ID

      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      // Stub the userService.findById method
      const updateByIdStub = sinon.stub(userService, 'updateById').returns({
        id: mockUserId,
        name: 'John Doe',
        email: 'john@example.com',
      });
  
      // Send a GET request to the /api/users/:id route with the mocked user ID
      const res = await request(app)
        .put(`/api/users/${mockUserId}`)
        .set('Authorization', authorizationHeader);
  
      // Assertions
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.deep.equal({
        id: mockUserId,
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(updateByIdStub.calledOnceWith(mockUserId)).to.be.true;
      expect(verifyStub.calledOnce).to.be.true;
  
      // Restore the stubbed method
      updateByIdStub.restore();
      verifyStub.restore();
    });
    
    it('should update a specific user', async () => {
      const mockUserId = 'user123'; // Mocked user ID

      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      // Stub the userService.findById method
      const updateByIdStub = sinon.stub(userService, 'updateById').throws(new Error(null));
  
      // Send a GET request to the /api/users/:id route with the mocked user ID
      const res = await request(app)
        .put(`/api/users/${mockUserId}`)
        .set('Authorization', authorizationHeader);
  
      // Assertions
      expect(res.statusCode).to.equal(500);
      expect(res.body).to.deep.equal({message: "Error updating User with id=user123"});
      expect(updateByIdStub.calledOnceWith(mockUserId)).to.be.true;
      expect(verifyStub.calledOnce).to.be.true;
  
      // Restore the stubbed method
      updateByIdStub.restore();
      verifyStub.restore();
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a specific user', async () => {
      const mockUserId = 'user123'; // Mocked user ID

      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      // Stub the userService.findById method
      const deleteById = sinon.stub(userService, 'deleteById').returns({message: "success"});
  
      // Send a GET request to the /api/users/:id route with the mocked user ID
      const res = await request(app)
        .delete(`/api/users/${mockUserId}`)
        .set('Authorization', authorizationHeader);
  
      // Assertions
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.deep.equal({message: "success"});
      expect(deleteById.calledOnceWith(mockUserId)).to.be.true;
      expect(verifyStub.calledOnce).to.be.true;
  
      // Restore the stubbed method
      deleteById.restore();
      verifyStub.restore();
    });
    
    it('should delete a specific user', async () => {
      const mockUserId = 'user123'; // Mocked user ID

      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      // Stub the userService.findById method
      const deleteByIdStub = sinon.stub(userService, 'deleteById').throws(new Error(null));
  
      // Send a GET request to the /api/users/:id route with the mocked user ID
      const res = await request(app)
        .delete(`/api/users/${mockUserId}`)
        .set('Authorization', authorizationHeader);
  
      // Assertions
      expect(res.statusCode).to.equal(500);
      expect(res.body).to.deep.equal({message: "Could not delete User with id=user123"});
      expect(deleteByIdStub.calledOnceWith(mockUserId)).to.be.true;
      expect(verifyStub.calledOnce).to.be.true;
  
      // Restore the stubbed method
      deleteByIdStub.restore();
      verifyStub.restore();
    });
  });

  describe('DELETE /api/users', () => {
    it('should delete all users', async () => {

      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      // Stub the userService.findById method
      const deleteAllId = sinon.stub(userService, 'deleteAll').returns({message: "success"});
  
      // Send a GET request to the /api/users/:id route with the mocked user ID
      const res = await request(app)
        .delete(`/api/users`)
        .set('Authorization', authorizationHeader);
  
      // Assertions
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.deep.equal({message: "success"});
      expect(deleteAllId.calledOnce).to.be.true;
      expect(verifyStub.calledOnce).to.be.true;
  
      // Restore the stubbed method
      deleteAllId.restore();
      verifyStub.restore();
    });
    
    it('should delete all users', async () => {

      const token = 'mocked-token';
      const authorizationHeader = `Bearer ${token}`;
      const verifyStub = sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
        // Simulate a valid token verification
        callback(null, { id: 'user123' });
      });
  
      // Stub the userService.findById method
      const deleteAllStub = sinon.stub(userService, 'deleteAll').throws(new Error(null));
  
      // Send a GET request to the /api/users/:id route with the mocked user ID
      const res = await request(app)
        .delete(`/api/users`)
        .set('Authorization', authorizationHeader);
  
      // Assertions
      expect(res.statusCode).to.equal(500);
      expect(res.body).to.deep.equal({message: "null"});
      expect(deleteAllStub.calledOnce).to.be.true;
      expect(verifyStub.calledOnce).to.be.true;
  
      // Restore the stubbed method
      deleteAllStub.restore();
      verifyStub.restore();
    });
  });
});
