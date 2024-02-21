const { Schema, model } = require('mongoose');

//     "_id": ObjectId("..."), // Уникальный идентификатор календаря
//     "userId": ObjectId("идентификатор_пользователя"),
//     "date": "2024-03-15" // Дата, за которую предназначен календарь
//     // Другие поля, если необходимо
//    "type" // Тип календаря (default, custom) enum: ['default', 'custom']
// description:
//   }

const CalendarModel = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['default', 'custom'], required: true },
    description: { type: String, default: '' },
});

module.exports = model('Calendar', CalendarModel);