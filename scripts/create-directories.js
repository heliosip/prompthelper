const fs = require('fs');
const path = require('path');

// Define the base directory
const baseDir = path.join(__dirname, '..', 'src', 'assets');

// Define the directories to create
const directories = [
  'icons',
  'images',
  'styles'
];

// Create the base directory if it doesn't exist
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
  console.log('Created base assets directory');
}

// Create each subdirectory
directories.forEach(dir => {
  const fullPath = path.join(baseDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created ${dir} directory`);
  } else {
    console.log(`${dir} directory already exists`);
  }
});

console.log('Directory creation complete!');