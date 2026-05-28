import { KafkaUrlFeederDto } from 'src/urlfeeder/dto/create-urlfeeder.dto';
import { extractFromUrl } from '@jcottam/html-metadata';

export async function WebHelper(data: KafkaUrlFeederDto): Promise<any> {
  const options = {
    timeout: 5000, // 5 second timeout
    metaTags: ['title', 'description', 'og:title'], // Only extract specific tags
  };
  const metadata = await extractFromUrl(data.url, options);
  console.log(`Extracted metadata for URL ${data.url}:`, metadata);
  return metadata;
}
