const fs = require('fs-extra');
const path = require('path');

// Move files from subdirectories to main dist
['popup', 'content', 'background'].forEach(dir => {
  fs.copySync(
    path.join(__dirname, `../dist/${dir}/style.css`),
    path.join(__dirname, `../dist/${dir}.css`),
    { overwrite: true }
  );
  fs.copySync(
    path.join(__dirname, `../dist/${dir}/index.iife.js`),
    path.join(__dirname, `../dist/${dir}.js`),
    { overwrite: true }
  );
  fs.removeSync(path.join(__dirname, `../dist/${dir}`));
});