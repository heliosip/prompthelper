import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 32, 48, 128];
const inputSvg = join(__dirname, '../src/assets/icons/icon.svg');
const outputDir = join(__dirname, '../src/assets/icons');

async function generateIcons() {
  try {
    for (const size of sizes) {
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(join(outputDir, `icon-${size}.png`));
      console.log(`Generated ${size}x${size} icon`);
    }
    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();