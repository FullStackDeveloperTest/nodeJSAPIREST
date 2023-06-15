const db = require("../models");
const User = db.users;
const userService = require("../services/user.service");
const { expect } = require('chai');
const sinon = require('sinon');

describe('User Service', () => {
  describe('create', () => {
    it('should create a new user', async () => {
      const createStub = sinon.stub(User, 'create').resolves({ id: 'user123', name: 'John Doe' });

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        phoneNumber: '1234567890',
        address: '123 Street',
        image: 'someImageurl',
        age: 25,
      };

      try {
        const result = await userService.create(userData);

        expect(createStub.calledOnceWith(userData)).to.be.false;
        expect(result).to.deep.equal({ id: 'user123', name: 'John Doe' });
      } finally {
        createStub.restore();
      }
    });

    it('should throw an error if an error occurs during user creation', async () => {
      // Stub the User.create method to throw an error
      const createStub = sinon.stub(User, 'create').throws(new Error('Some error occurred'));
    
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        phoneNumber: '1234567890',
        address: '123 Street',
        image: 'someImageurl',
        age: 25,
      };
    
      // Call the create function and expect it to throw an error
      try {
        await userService.create(userData);
        // If the execution reaches this point, the asynchronous function did not throw an error
        throw new Error('Expected an error to be thrown');
      } catch (error) {
        // Assertions
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Some error occurred while creating the User.');
      }
    
      // Restore the stubbed method
      createStub.restore();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      // Stub the User.findOne method
      const findOneStub = sinon.stub(User, 'findOne').resolves({ id: 'user123', name: 'John Doe' });

      const email = 'john@example.com';

      // Call the findByEmail function
      const result = await userService.findByEmail(email);

      // Assertions
      expect(findOneStub.calledOnceWith({ where: { email: email } })).to.be.true;
      expect(result).to.deep.equal({ id: 'user123', name: 'John Doe' });

      // Restore the stubbed method
      findOneStub.restore();
    });

    it('should throw an error if an error occurs during user retrieval by email', async () => {
      // Stub the User.findOne method to throw an error
      const findOneStub = sinon.stub(User, 'findOne').throws(new Error('Some error occurred'));

      const email = 'john@example.com';

      try {
        await userService.findByEmail(email);
        // If the execution reaches this point, the asynchronous function did not throw an error
        throw new Error('Expected an error to be thrown');
      } catch (error) {
        // Assertions
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Error retrieving User with email: john@example.com');
      }

      // Restore the stubbed method
      findOneStub.restore();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      // Stub the User.findOne method
      const findByPkStub = sinon.stub(User, 'findByPk').resolves({ id: 1, name: 'John Doe' });

      // Call the findByEmail function
      const result = await userService.findById(1);

      // Assertions
      expect(findByPkStub.calledOnceWith(1)).to.be.true;
      expect(result).to.deep.equal({ id: 1, name: 'John Doe' });

      // Restore the stubbed method
      findByPkStub.restore();
    });

    it('should throw an error if an error occurs during user retrieval by email', async () => {
      // Stub the User.findOne method to throw an error
      const findByPkStub = sinon.stub(User, 'findByPk').throws(new Error('Some error occurred'));

      try {
        await userService.findById(1);
        // If the execution reaches this point, the asynchronous function did not throw an error
        throw new Error('Expected an error to be thrown');
      } catch (error) {
        // Assertions
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Error retrieving User with id=1');
      }

      // Restore the stubbed method
      findByPkStub.restore();
    });
  });

  describe('updateById', () => {
    it('should update a user by id', async () => {
      // Stub the User.findOne method
      const updateStub = sinon.stub(User, 'update').resolves([1]);

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        phoneNumber: '1234567890',
        address: '123 Street',
        image: 'someImageurl',
        age: 25,
      };
      // Call the findByEmail function
      const result = await userService.updateById(1, userData);

      // Assertions
      expect(updateStub.calledOnceWith(userData, { where: { id: 1 }})).to.be.true;
      expect(result).to.deep.equal({ message: "User was updated successfully." });

      // Restore the stubbed method
      updateStub.restore();
    });

    it('should not be able to update user', async () => {
      // Stub the User.findOne method to throw an error
      const updateStub = sinon.stub(User, 'update').resolves([2]);

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        phoneNumber: '1234567890',
        address: '123 Street',
        image: 'someImageurl',
        age: 25,
      };
      
      try{
        await userService.updateById(1, userData);

        throw new Error('Expected an error to be thrown');
      } catch (err) {
        // Assertions
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Error updating User with id=1');
      }

      // Restore the stubbed method
      updateStub.restore();
    });
  });

  describe('deleteById', () => {
    it('should delete a user by id', async () => {
      // Stub the User.findOne method
      const destroyStub = sinon.stub(User, 'destroy').resolves(1);
      // Call the findByEmail function
      const result = await userService.deleteById(1);

      // Assertions
      expect(destroyStub.calledOnceWith({ where: { id: 1 }})).to.be.true;
      expect(result).to.deep.equal({ message: "User was deleted successfully!" });

      // Restore the stubbed method
      destroyStub.restore();
    });

    it('should not be able to delete user', async () => {
      // Stub the User.findOne method to throw an error
      const destroyStub = sinon.stub(User, 'destroy').resolves(2);
      
      try{
        await userService.deleteById(1);

        throw new Error('Expected an error to be thrown');
      } catch (err) {
        // Assertions
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Could not delete User with id=1');
      }

      // Restore the stubbed method
      destroyStub.restore();
    });
  });

  describe('findall', () => {
    it('should get all users', async () => {
      // Stub the User.findOne method
      const findAllStub = sinon.stub(User, 'findAll').resolves([]);
      // Call the findByEmail function
      const result = await userService.findAll();

      // Assertions
      expect(findAllStub.calledOnce).to.be.true;
      expect(result).to.deep.equal([]);

      // Restore the stubbed method
      findAllStub.restore();
    });

    it('should not be able to get all users', async () => {
      // Stub the User.findOne method to throw an error
      const findAllStub = sinon.stub(User, 'findAll').throws(new Error('Some error occurred'));
      
      try{
        await userService.findAll();

        throw new Error('Expected an error to be thrown');
      } catch (err) {
        // Assertions
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Some error occurred while retrieving users.');
      }

      // Restore the stubbed method
      findAllStub.restore();
    });
  });

  describe('delete All', () => {
    it('should delete all users', async () => {
      // Stub the User.findOne method
      const destroyStub = sinon.stub(User, 'destroy').resolves(1);
      // Call the findByEmail function
      const result = await userService.deleteAll();

      // Assertions
      expect(destroyStub.calledOnce).to.be.true;
      expect(result).to.deep.equal({ message: '1 Users were deleted successfully!' });

      // Restore the stubbed method
      destroyStub.restore();
    });

    it('should not be able to get all users', async () => {
      // Stub the User.findOne method to throw an error
      const destroyStub = sinon.stub(User, 'destroy').throws(new Error('Some error occurred'));
      
      try{
        await userService.deleteAll();

        throw new Error('Expected an error to be thrown');
      } catch (err) {
        // Assertions
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Some error occurred while removing all users.');
      }

      // Restore the stubbed method
      destroyStub.restore();
    });
  });

  // Add more tests for other functions in the file
});
