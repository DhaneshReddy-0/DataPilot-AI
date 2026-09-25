import { parse as parseCsvSync } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

/**
 * Normalizes an array of records and detects primitive data types.
 */
export function parseUploadedFile(buffer, originalname, mimetype) {
  const extension = originalname.split('.').pop().toLowerCase();
  let rawData = [];

  if (extension === 'csv' || mimetype === 'text/csv') {
    rawData = parseCSV(buffer);
  } else if (['xlsx', 'xls'].includes(extension) || mimetype.includes('spreadsheet') || mimetype.includes('excel')) {
    rawData = parseExcel(buffer);
  } else {
    // Attempt fallback heuristic assuming CSV if extension is missing/wrong
    try {
      rawData = parseCSV(buffer);
    } catch {
      throw new Error('Unsupported file format. Please upload CSV or Excel files only.');
    }
  }

  if (!Array.isArray(rawData) || rawData.length === 0) {
    throw new Error('No valid records found in the uploaded file.');
  }

  // Sanitize keys and values
  return sanitizeRecords(rawData);
}

function parseCSV(buffer) {
  const content = buffer.toString('utf-8');
  // Auto-detect delimiter: comma, semicolon, tab, pipe
  const firstLine = content.split('\n')[0] || '';
  let delimiter = ',';
  if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = ';';
  else if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = '\t';
  else if ((firstLine.match(/\|/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = '|';

  const records = parseCsvSync(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter,
    relax_quotes: true,
    relax_column_count: true
  });
  return records;
}

function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error('Excel workbook has no sheets');
  const sheet = workbook.Sheets[firstSheetName];
  const records = XLSX.utils.sheet_to_json(sheet, { defval: null });
  return records;
}

function sanitizeRecords(records) {
  return records.map(row => {
    const cleanRow = {};
    for (const [key, val] of Object.entries(row)) {
      const cleanKey = String(key).trim().replace(/[^\w\s-]/g, '_');
      let cleanVal = val;
      if (typeof cleanVal === 'string') {
        cleanVal = cleanVal.trim();
        if (cleanVal === '' || cleanVal.toLowerCase() === 'null' || cleanVal.toLowerCase() === 'na' || cleanVal.toLowerCase() === 'n/a') {
          cleanVal = null;
        }
      }
      cleanRow[cleanKey] = cleanVal;
    }
    return cleanRow;
  });
}
