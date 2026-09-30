const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Authentication Utilities Unit Tests', () => {
  const SECRET = 'test_secret_key_123';

  test('bcrypt successfully hashes and verifies password', async () => {
    const rawPassword = 'SecurePassword2026!';
    const hash = await bcrypt.hash(rawPassword, 10);

    assert.notEqual(rawPassword, hash, 'Hash must not equal raw password');
    const isValid = await bcrypt.compare(rawPassword, hash);
    assert.equal(isValid, true, 'bcrypt.compare should return true for matching password');

    const isWrong = await bcrypt.compare('WrongPassword', hash);
    assert.equal(isWrong, false, 'bcrypt.compare should return false for wrong password');
  });

  test('jwt sign and verify preserves user payload correctly', () => {
    const userPayload = {
      id: 'user-uuid-456',
      email: 'traveler@tripmate.io',
      name: 'Globe Trotter'
    };

    const token = jwt.sign(userPayload, SECRET, { expiresIn: '1h' });
    assert.ok(typeof token === 'string', 'Token should be a string');

    const decoded = jwt.verify(token, SECRET);
    assert.equal(decoded.id, userPayload.id);
    assert.equal(decoded.email, userPayload.email);
    assert.equal(decoded.name, userPayload.name);
  });

  test('jwt verification fails with incorrect secret', () => {
    const token = jwt.sign({ id: '123' }, SECRET);
    assert.throws(() => {
      jwt.verify(token, 'different_wrong_secret');
    });
  });
});
