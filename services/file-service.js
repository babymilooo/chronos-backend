const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const userController = require('../controllers/user-controller');

// Настройка хранения multer
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const fileHandler = (req, res, next) => {
    if (!req.file) return next();

    const file = req.file;
    const hash = crypto.createHash('sha256');

    hash.update(file.buffer); // обновляем хеш буфером файла
    const fileHash = hash.digest('hex');
    const fileName = fileHash + '-' + file.originalname;
    const filePath = path.join('uploads/avatars', fileName);

    const dir = path.join('uploads', 'avatars');

    // Создание директории, если она не существует
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Проверка, существует ли файл
    if (fs.existsSync(filePath)) {
        console.log('Файл уже существует:', filePath);
        req.file.path = filePath; // Устанавливаем путь файла в req.file
        userController.changeAvatar(req, res, next); // Вызываем контроллер
    } else {
        // Сохраняем файл, если он уникален
        fs.writeFileSync(filePath, file.buffer);
        req.file.path = filePath; // Обновляем путь файла в запросе
        next();
    }
};

module.exports = { upload, fileHandler };