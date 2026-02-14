import { createObjectCsvWriter } from 'csv-writer';
import PDFDocument from 'pdfkit';
import { SongModel } from '../models/Song';
import { Readable } from 'stream';

export class ExportService {
  static async exportToCSV(rankings: Array<{ rank: number; song: SongModel }>): Promise<string> {
    const csvData = rankings.map(({ rank, song }) => ({
      rank,
      title: song.title,
      artist: song.artist,
      averageScore: song.averageScore?.toFixed(2) || 'N/A',
      totalVotes: song.totalVotes,
    }));

    // Return CSV as string
    const header = 'Rang,Titel,Interpret,Durchschnittspunktzahl,Anzahl Votes\n';
    const rows = csvData
      .map(row => `${row.rank},"${row.title}","${row.artist}",${row.averageScore},${row.totalVotes}`)
      .join('\n');

    return header + rows;
  }

  static async exportToPDF(rankings: Array<{ rank: number; song: SongModel }>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('SSC - School Song Contest', { align: 'center' });
      doc.moveDown();
      doc.fontSize(18).text('Endergebnisse', { align: 'center' });
      doc.moveDown(2);

      // Table Header
      doc.fontSize(12).font('Helvetica-Bold');
      const tableTop = doc.y;
      const colWidths = { rank: 50, title: 180, artist: 150, score: 100 };
      const startX = 50;

      doc.text('Rang', startX, tableTop, { width: colWidths.rank, continued: true });
      doc.text('Titel', startX + colWidths.rank, tableTop, { width: colWidths.title, continued: true });
      doc.text('Interpret:in', startX + colWidths.rank + colWidths.title, tableTop, {
        width: colWidths.artist,
        continued: true,
      });
      doc.text('Ø Punkte', startX + colWidths.rank + colWidths.title + colWidths.artist, tableTop, {
        width: colWidths.score,
      });

      doc.moveDown();
      doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Table Rows
      doc.font('Helvetica');
      rankings.forEach(({ rank, song }) => {
        const y = doc.y;

        if (y > 700) {
          doc.addPage();
        }

        doc.text(rank.toString(), startX, y, { width: colWidths.rank, continued: true });
        doc.text(song.title, startX + colWidths.rank, y, { width: colWidths.title, continued: true });
        doc.text(song.artist, startX + colWidths.rank + colWidths.title, y, {
          width: colWidths.artist,
          continued: true,
        });
        doc.text(song.averageScore?.toFixed(2) || 'N/A', startX + colWidths.rank + colWidths.title + colWidths.artist, y, {
          width: colWidths.score,
        });

        doc.moveDown();
      });

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica-Oblique').text(`Erstellt am ${new Date().toLocaleDateString('de-DE')}`, {
        align: 'center',
      });

      doc.end();
    });
  }
}
