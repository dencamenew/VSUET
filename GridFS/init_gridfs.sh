#!/bin/bash
set -e

echo "Initializing GridFS with metadata..."

# Ждём старта MongoDB
sleep 5

# Список файлов и метаданных
declare -a FILES=(
    "BashNotesForProfessionals.pdf|Bash Notes for Professionals|Stack Overflow Documentation contributors|Shell / Linux"
    "DotNETFrameworkNotesForProfessionals.pdf|.NET Framework Notes for Professionals|Stack Overflow Documentation contributors|.NET Framework"
    "GitNotesForProfessionals.pdf|Git Notes for Professionals|Stack Overflow Documentation contributors|Version Control / Git"
    "LinuxNotesForProfessionals.pdf|Linux Notes for Professionals|Stack Overflow Documentation contributors|Linux"
    "PythonNotesForProfessionals.pdf|Python Notes for Professionals|Stack Overflow Documentation contributors|Python"
    "SpringFrameworkNotesForProfessionals.pdf|Spring Framework Notes for Professionals|Stack Overflow Documentation contributors|Spring Framework / Java"
)

# Переходим в директорию с PDF
cd /books

for FILE_DATA in "${FILES[@]}"; do
    IFS='|' read -r FILE TITLE AUTHOR TOPIC <<< "$FILE_DATA"

    echo "Uploading $FILE..."

    # Загружаем файл в GridFS, filename будет просто FILE
    mongofiles -d library put "$FILE"

    # Добавляем метаданные по имени файла
    mongosh library --eval "
      db.fs.files.updateOne(
        { filename: '$FILE' },
        { \$set: { metadata: { title: '$TITLE', author: '$AUTHOR', topic: '$TOPIC' } } }
      );
    "

    echo "Uploaded with metadata: { metadata: { title: '$TITLE', author: '$AUTHOR', topic: '$TOPIC' } }"
done

echo "GridFS initialization with metadata done."
