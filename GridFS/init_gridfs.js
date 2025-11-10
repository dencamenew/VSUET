// init_gridfs.js
print("Initializing GridFS...");

// Подключаемся к базе "library"
db = db.getSiblingDB("library");

// Создаём bucket GridFS
var bucket = new Mongo().getDB("library").getBucket("fs");

// Функция для загрузки файла
function uploadFile(filePath, fileName) {
    var file = cat(filePath); // cat читает файл из контейнера
    var binaryData = new BinData(0, file);
    bucket.uploadFromStream(fileName, binaryData);
    print("Uploaded:", fileName);
}

// Загрузка всех файлов из /library_files
var files = ["book1.pdf", "book2.docx"]; // перечисли свои файлы
files.forEach(f => {
    uploadFile("/library_files/" + f, f);
});

print("GridFS initialization done.");
