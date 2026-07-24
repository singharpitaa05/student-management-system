import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export const exportToExcel = async (data, columns) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Export Data');

  // Define columns
  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 20
  }));

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add rows
  worksheet.addRows(data);

  // Return buffer
  return await workbook.xlsx.writeBuffer();
};

export const exportToPDF = async (data, columns, title) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Title
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown(2);

      // Simple Table Simulation
      const startX = 30;
      let startY = doc.y;
      
      // Draw Headers
      doc.fontSize(10).font('Helvetica-Bold');
      let currentX = startX;
      columns.forEach(col => {
        doc.text(col.header, currentX, startY, { width: (col.width || 20) * 4 });
        currentX += (col.width || 20) * 5; // roughly convert excel width to points
      });

      doc.moveDown(0.5);
      startY = doc.y;
      doc.moveTo(startX, startY).lineTo(560, startY).stroke();
      doc.moveDown(0.5);

      // Draw Rows
      doc.font('Helvetica');
      data.forEach(row => {
        currentX = startX;
        startY = doc.y;
        
        // Check for page break
        if (startY > 750) {
          doc.addPage();
          startY = doc.y;
        }

        columns.forEach(col => {
          let value = row[col.key];
          if (value === undefined || value === null) value = '';
          doc.text(value.toString(), currentX, startY, { width: (col.width || 20) * 4 });
          currentX += (col.width || 20) * 5;
        });
        doc.moveDown(0.5);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
