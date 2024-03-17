module.exports = class UserDto {
    id;
    bio;
    username;
    image;
    email;
    constructor(model) {
        this.id = model._id;
        this.bio = model.bio;
        this.username = model.username;
        this.image = model.image;
        this.email = model.email;
    }
}
