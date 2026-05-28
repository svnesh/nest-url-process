import { KafkaUrlFeederDto } from 'src/urlfeeder/dto/create-urlfeeder.dto';
import { PDFParse } from 'pdf-parse';

export async function PdfHelper(data: KafkaUrlFeederDto): Promise<any> {
  try {
    const parser = new PDFParse({ url: data.url });
    const result = await parser.getText();
    return result;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
}
