// Script to upload music files from public/Background-Music to R2
// Usage: node scripts/upload-music-to-r2.js

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const musicFiles = [
  { file: 'GreentoBlue.mp3', style: 'greento-blue' },
  { file: 'Idea10.mp3', style: 'idea-10' },
];

async function uploadMusicFile(filePath, style) {
  try {
    const fileBuffer = await readFile(filePath);
    
    // Create FormData
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'audio/mpeg' });
    formData.append('audio', blob, filePath.split('/').pop());
    formData.append('style', style);

    // Upload via API endpoint
    const response = await fetch('http://localhost:5175/api/background-music/upload-built-in', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Successfully uploaded ${filePath} as ${style}`);
      return true;
    } else {
      console.error(`❌ Failed to upload ${filePath}:`, data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error(`❌ Error uploading ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('Starting music upload...\n');
  
  const basePath = join(__dirname, '..', 'public', 'Background-Music '); // Note: directory has a space at the end
  
  for (const { file, style } of musicFiles) {
    const filePath = join(basePath, file);
    console.log(`Uploading ${file} as ${style}...`);
    await uploadMusicFile(filePath, style);
  }
  
  console.log('\n✅ Upload complete!');
}

main().catch(console.error);

