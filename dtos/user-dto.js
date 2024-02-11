module.exports = class UserDto {
    isActivated;
    email;
    id;

    constructor(model) {
        this.isActivated = model.isActivated;
        this.email = model.email;
        this.id = model._id;
    }
}
