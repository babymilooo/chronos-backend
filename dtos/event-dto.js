module.exports = class EventDto {
    id;
    user;
    eventType;
    title;
    description;
    startTime;
    endTime;
    notification;
    repeat;
    status;
    priority;
    followers;

    constructor(model) {
        this.id = model._id;
        this.user = model.user;
        this.eventType = model.eventType;
        this.title = model.title;
        this.description = model.description;
        this.startTime = model.startTime;
        this.endTime = model.endTime;
        this.notification = model.notification;
        this.repeat = model.repeat;
        this.status = model.status;
        this.priority = model.priority;
        this.followers = model.followers;
    }
}
