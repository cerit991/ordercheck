const PDFDocument = require('pdfkit');
const path = require('path');
const { formatSelectedCategories } = require('./utils');

const FONT_NAME = 'DejaVuSans';
const FONT_PATH = path.join(__dirname, '..', 'font', 'DejaVuSans.ttf');

const COLORS = {
  headerBg: '#217346',
  headerText: '#FFFFFF',
  headerBorder: '#1E6B3E',
  rowEven: '#FFFFFF',
  rowOdd: '#F2F2F2',
  rowHover: '#E2EFDA',
  border: '#BFBFBF',
  borderDark: '#8C8C8C',
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  titleBg: '#1F4E79',
  titleText: '#FFFFFF',
  infoBg: '#D6DCE4',
  accent: '#5B9BD5',
};

const buildTextBody = ({ requester, department, items }) => {
  const categorySummary = formatSelectedCategories(items);
  const lines = [
    'Merhaba,',
    '',
    'şağıdaki sipariş talebi bilgilerini inceleyebilirsiniz:',
    '',
    `Siparişi Oluşturan: ${requester}`,
    `Departman: ${department}`,
    `Firma: ${categorySummary}`,
    '',
    ...items.map((item, index) => `${index + 1}. ${item.name} --- ${item.quantity} ${item.unit}`),
    '',
    `Toplam Kalem: ${items.length}`,
    '',
    'İyi Çalışmalar.',
  ];
  return lines.join('\n');
};

const drawPdfContent = (doc, { requester, department, items }) => {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const startX = doc.page.margins.left;
  const categorySummary = formatSelectedCategories(items);
  const createdAt = new Date();

  const headerHeight = 45;
  doc.rect(startX, doc.y, pageWidth, headerHeight).fill(COLORS.titleBg);

  doc.fontSize(16)
    .fillColor(COLORS.titleText)
    .text('SIPARIS TALEBI', startX, doc.y - headerHeight + 12, {
      width: pageWidth,
      align: 'center',
    });

  doc.fontSize(8)
    .fillColor('#A0C4E8')
    .text('Satin Alma Departmani Siparis Formu', startX, doc.y + 6, {
      width: pageWidth,
      align: 'center',
    });

  doc.y += 18;

  const infoStartY = doc.y;
  const infoHeight = 50;
  const infoCells = [
    { label: 'Siparisi Olusturan', value: requester },
    { label: 'Departman', value: department },
    { label: 'Firma', value: categorySummary },
    { label: 'Tarih', value: createdAt.toLocaleDateString('tr-TR') },
  ];
  const infoCellWidth = pageWidth / infoCells.length;

  doc.rect(startX, infoStartY, pageWidth, infoHeight).fill(COLORS.infoBg);

  doc.strokeColor(COLORS.border).lineWidth(1);
  for (let i = 1; i < infoCells.length; i += 1) {
    const x = startX + infoCellWidth * i;
    doc.moveTo(x, infoStartY)
      .lineTo(x, infoStartY + infoHeight)
      .stroke();
  }

  doc.rect(startX, infoStartY, pageWidth, infoHeight).stroke();

  infoCells.forEach((cell, index) => {
    const cellX = startX + (infoCellWidth * index) + 8;
    doc.fontSize(7)
      .fillColor(COLORS.textSecondary)
      .text(cell.label, cellX, infoStartY + 8, { width: infoCellWidth - 16 });

    doc.fontSize(9)
      .fillColor(COLORS.textPrimary)
      .text(cell.value, cellX, infoStartY + 22, { width: infoCellWidth - 16 });
  });

  doc.y = infoStartY + infoHeight + 15;

  const columns = [
    { header: 'No', width: 40, align: 'center' },
    { header: 'Urun Adi', width: 340, align: 'left' },
    { header: 'Miktar', width: 80, align: 'right' },
    { header: 'Birim', width: pageWidth - 40 - 340 - 80, align: 'center' },
  ];

  const rowHeight = 22;
  const headerRowHeight = 24;

  const drawTableHeader = (y) => {
    doc.rect(startX, y, pageWidth, headerRowHeight).fill(COLORS.headerBg);
    doc.strokeColor(COLORS.headerBorder)
      .lineWidth(2)
      .moveTo(startX, y + headerRowHeight)
      .lineTo(startX + pageWidth, y + headerRowHeight)
      .stroke();

    let colX = startX;
    columns.forEach((col) => {
      doc.fontSize(8)
        .fillColor(COLORS.headerText)
        .text(col.header, colX + 5, y + 7, {
          width: col.width - 10,
          align: col.align,
        });

      if (colX > startX) {
        doc.strokeColor(COLORS.headerBorder)
          .lineWidth(1)
          .moveTo(colX, y)
          .lineTo(colX, y + headerRowHeight)
          .stroke();
      }

      colX += col.width;
    });

    return y + headerRowHeight;
  };

  const drawTableRow = (y, rowData, rowIndex) => {
    const isEven = rowIndex % 2 === 0;
    const bgColor = isEven ? COLORS.rowEven : COLORS.rowOdd;

    doc.rect(startX, y, pageWidth, rowHeight).fill(bgColor);

    let colX = startX;
    const rowValues = [
      (rowIndex + 1).toString(),
      rowData.name || '',
      rowData.quantity?.toString() || '',
      rowData.unit || '-',
    ];

    columns.forEach((col, colIndex) => {
      if (colX > startX) {
        doc.strokeColor(COLORS.border)
          .lineWidth(0.5)
          .moveTo(colX, y)
          .lineTo(colX, y + rowHeight)
          .stroke();
      }

      doc.fontSize(8)
        .fillColor(COLORS.textPrimary)
        .text(rowValues[colIndex], colX + 5, y + 6, {
          width: col.width - 10,
          align: col.align,
        });

      colX += col.width;
    });

    doc.strokeColor(COLORS.border)
      .lineWidth(0.5)
      .moveTo(startX, y + rowHeight)
      .lineTo(startX + pageWidth, y + rowHeight)
      .stroke();

    return y + rowHeight;
  };

  const drawTableBorder = (startY, endY) => {
    if (endY <= startY) {
      return;
    }
    doc.strokeColor(COLORS.borderDark)
      .lineWidth(1.5)
      .rect(startX, startY, pageWidth, endY - startY)
      .stroke();
  };

  let tableY = doc.y;
  let tableStartY = tableY;
  tableY = drawTableHeader(tableY);

  items.forEach((item, index) => {
    if (tableY + rowHeight > doc.page.height - doc.page.margins.bottom - 60) {
      drawTableBorder(tableStartY, tableY);
      doc.addPage();

      const newPageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const widthDelta = newPageWidth - pageWidth;
      if (Math.abs(widthDelta) > 0.5) {
        columns[3].width = newPageWidth - 40 - 340 - 80;
      }

      tableY = doc.page.margins.top;
      tableStartY = tableY;
      tableY = drawTableHeader(tableY);
    }

    tableY = drawTableRow(tableY, item, index);
  });

  drawTableBorder(tableStartY, tableY);

  doc.y = tableY + 12;

  const summaryWidth = 160;
  const summaryX = startX + pageWidth - summaryWidth;
  const summaryY = doc.y;
  const summaryHeight = 28;

  doc.rect(summaryX, summaryY, summaryWidth, summaryHeight).fill(COLORS.rowOdd);
  doc.strokeColor(COLORS.borderDark)
    .lineWidth(1)
    .rect(summaryX, summaryY, summaryWidth, summaryHeight)
    .stroke();

  doc.fontSize(8)
    .fillColor(COLORS.textSecondary)
    .text('Toplam Kalem:', summaryX + 8, summaryY + 8);

  doc.fontSize(9)
    .fillColor(COLORS.headerBg)
    .text(items.length.toString(), summaryX + summaryWidth - 40, summaryY + 8, {
      width: 32,
      align: 'right',
    });

  doc.y = summaryY + summaryHeight + 20;

  doc.strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(startX, doc.y)
    .lineTo(startX + pageWidth, doc.y)
    .stroke();

  doc.y += 8;

  doc.fontSize(7)
    .fillColor(COLORS.textSecondary)
    .text(
      'Bu dokuman sistem tarafindan otomatik olarak olusturulmustur. | ' +
        `Olusturulma: ${createdAt.toLocaleString('tr-TR')}`,
      startX,
      doc.y,
      { width: pageWidth, align: 'center' },
    );

  doc.fontSize(7)
    .fillColor(COLORS.accent)
    .text('Siparis Yonetim Sistemi v1.0', startX, doc.y + 12, {
      width: pageWidth,
      align: 'right',
    });
};

const generatePdfBuffer = ({ requester, department, items }) => new Promise((resolve, reject) => {
  try {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
    });

    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.registerFont(FONT_NAME, FONT_PATH);
    doc.font(FONT_NAME);

    drawPdfContent(doc, { requester, department, items });

    doc.end();
  } catch (error) {
    reject(error);
  }
});

module.exports = {
  generatePdfBuffer,
  buildTextBody,
};
