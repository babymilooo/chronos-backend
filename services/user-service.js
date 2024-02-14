const userModel = require('../models/user-model');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exeptions/api-error');

/*
    { new: true } - return the modified document (after the update)
    { new: false } - return the original document (before the update)
*/

class userService {
    async getAllUsers() {
        const users = await userModel.find();
        const usersDto = users.map(user => new UserDto(user));
        return { users: usersDto };
    }

    async getUserById(id) {
        if (!id) {
            throw ApiError.BadRequest('Id is not defined');
        }
        
        const user = await userModel.findById(id);
        return new UserDto(user);
    }

    async getUserByUsername(username) {
        if (!username) {
            throw ApiError.BadRequest('Username is not defined');
        }
        
        const user = await userModel.findOne({ username });
        return new UserDto(user);
    }

    async updateUserById(id, data) {
        const { username, email, bio } = data;

        if (!id) {
            throw ApiError.BadRequest('Id is not defined');
        }

        if (!username) {
            throw ApiError.BadRequest('Username is not defined');
        }

        if (!email) {
            throw ApiError.BadRequest('Email is not defined');
        }

        if (!bio) {
            throw ApiError.BadRequest('Bio is not defined');
        }

        const updatedUser = await userModel.findByIdAndUpdate(id, { username, email, bio }, { new: true });
        return new UserDto(updatedUser);
    }

    async deleteUserById(id) {
        if (!id) {
            throw ApiError.BadRequest('Id is not defined');
        }

        const user = await userModel.findByIdAndDelete(id);
        return new UserDto(user);
    }

    // async updateProfileBio(id, bio) {
    //     if (!id) {
    //         throw ApiError.BadRequest('Id is not defined');
    //     }

    //     if (!bio) {
    //         throw ApiError.BadRequest('Bio is not defined');
    //     }

    //     const user = await userModel.findByIdAndUpdate(id, { bio }, { new: true });
    //     return new UserDto(user);
    // }

    // async updateProfileEmail(id, email) {
    //     if (!id) {
    //         throw ApiError.BadRequest('Id is not defined');
    //     }

    //     if (!email) {
    //         throw ApiError.BadRequest('Email is not defined');
    //     }

    //     const user = await userModel.findByIdAndUpdate(id, { email }, { new: true });
    //     return new UserDto(user);
    // }

    // async updateProfileUsername(id, username) {
    //     if (!id) {
    //         throw ApiError.BadRequest('Id is not defined');
    //     }

    //     if (!username) {
    //         throw ApiError.BadRequest('Username is not defined');
    //     }

    //     const user = await userModel.findByIdAndUpdate(id, { username }, { new: true });
    //     return new UserDto(user);
    // }

    async updateProfilePassword(id, oldPassword, newPassword) {
        if (!id) {
            throw ApiError.BadRequest('Id is not defined');
        }

        if (!password) {
            throw ApiError.BadRequest('Password is not defined');
        }

        if (password.length < process.env.PASSWORD_MIN_LENGTH) {
            throw ApiError.BadRequest('Password is too short');
        }

        const user = await userModel.findById(id);
        const isPassEquals = await bcrypt.compare(oldPassword, user.password);

        if (!isPassEquals) {
            throw ApiError.BadRequest('Incorrect password');
        }

        const hashPassword = await bcrypt.hash(newPassword, parseInt(process.env.SALT_ROUNDS));
        const updatedUser = await userModel.findByIdAndUpdate(id, { password: hashPassword }, { new: true });
        return new UserDto(updatedUser);
    }

    async updateProfileImage(id, image) {
        if (!id) {
            throw ApiError.BadRequest('Id is not defined');
        }

        const user = await userModel.findByIdAndUpdate(id, { image }, { new: true });
        return new UserDto(user);
    }

}

module.exports = new userService();