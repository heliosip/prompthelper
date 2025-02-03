const sharp = require('sharp');
const path = require('path');

const sizes = [16, 32, 48, 128];
const inputSvg = path.join(__dirname, '../src/assets/icons/icon.svg');
const outputDir = path.join(__dirname, '../src/assets/icons');

async function generateIcons() {
  try {
    for (const size of sizes) {
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}.png`));
      console.log(`Generated ${size}x${size} icon`);
    }
    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();