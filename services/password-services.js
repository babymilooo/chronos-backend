const crypto = require('crypto');
const bcrypt = require('bcrypt');

class PasswordService {
    generateTemporaryPassword(length = 8) {
        return crypto.randomBytes(length).toString('hex').slice(0, length);
    }

    async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    async comparePasswords(password, hash) {
        return await bcrypt.compare(password, hash);
    }
}

module.exports = new PasswordService();