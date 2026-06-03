import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export async function downloadImage(url: string): Promise<string> {
  const uniqueFilename = `image_${uuidv4()}`;
  //get extension of the image from the url
  const extension = path.extname(url).split('?')[0] || '.jpg';
  try {
    const destinationPath = path.join(
      process.cwd(),
      '/assets/',
      `${uniqueFilename}${extension}`,
    );
    const writer = fs.createWriteStream(destinationPath);
    const response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(destinationPath));
      writer.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Failed to download image from ${url}: ${error.message}`);
  }
}

export default downloadImage;
