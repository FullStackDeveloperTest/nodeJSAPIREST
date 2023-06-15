const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const { expect } = require('chai');

const verifyToken = require('../middleware/authMiddleware');

describe('verifyToken', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call next if a valid token is provided', () => {
    const token = 'valid-token';
    const decodedToken = { id: 'user123' };

    req.headers['authorization'] = `Bearer ${token}`;

    sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
      callback(null, decodedToken);
    });

    verifyToken(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(req.userId).to.equal(decodedToken.id);
    expect(res.status.called).to.be.false;
    expect(res.send.called).to.be.false;
  });

  it('should return 403 if no token is provided', () => {
    verifyToken(req, res, next);

    expect(next.called).to.be.false;
    expect(res.status.calledWith(403)).to.be.true;
    expect(res.send.calledWith({ message: 'No token provided!' })).to.be.true;
  });

  it('should return 403 if token is missing', () => {
    req.headers['authorization'] = 'Bearer ';

    verifyToken(req, res, next);

    expect(next.called).to.be.false;
    expect(res.status.calledWith(403)).to.be.true;
    expect(res.send.calledWith({ message: 'No token provided!' })).to.be.true;
  });

  it('should return 401 if token verification fails', () => {
    const token = 'invalid-token';

    req.headers['authorization'] = `Bearer ${token}`;

    sinon.stub(jwt, 'verify').callsFake((token, secret, callback) => {
      callback(new Error('Token verification failed'));
    });

    verifyToken(req, res, next);

    expect(next.called).to.be.false;
    expect(res.status.calledWith(401)).to.be.true;
    expect(res.send.calledWith({ message: 'Unauthorized!' })).to.be.true;
  });
});
