module.exports = class UserDto {
    id;
    bio;
    username;
    image;
    constructor(model) {
        this.id = model._id;
        this.bio = model.bio;
        this.username = model.username;
        this.image = model.image;
    }
}
