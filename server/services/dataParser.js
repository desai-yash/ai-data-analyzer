import fs from 'fs';
import csv from 'csv-parser';
import xlsx from 'xlsx';

const PREVIEW_LIMIT = 10;

const normalizeValue = (value) => {
  if (value === undefined || value === null) return '';
  return typeof value === 'string' ? value.trim() : value;
};

const normalizeRow = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [String(key).trim(), normalizeValue(value)])
  );

const isEmpty = (value) => value === '' || value === undefined || value === null;

const isNumeric = (value) => !isEmpty(value) && !Number.isNaN(Number(value));

const isBoolean = (value) => {
  if (typeof value === 'boolean') return true;
  if (typeof value !== 'string') return false;
  return ['true', 'false', 'yes', 'no'].includes(value.toLowerCase());
};

const isDateLike = (value) => {
  if (isEmpty(value) || isNumeric(value)) return false;
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
};

const inferColumnType = (name, rows) => {
  const values = rows.map((row) => row[name]).filter((value) => !isEmpty(value));

  if (values.length === 0) return 'empty';
  if (values.every(isNumeric)) return 'number';
  if (values.every(isBoolean)) return 'boolean';
  if (values.every(isDateLike)) return 'date';

  return 'string';
};

const getColumnNames = (rows) => {
  const names = new Set();
  rows.forEach((row) => Object.keys(row).forEach((key) => names.add(key)));
  return Array.from(names);
};

const getSafeColumnName = (name, index, usedNames) => {
  const trimmedName = String(name || '').trim();
  const baseName = trimmedName === '' ? `Column ${index + 1}` : trimmedName;
  let safeName = baseName;
  let duplicateIndex = 2;

  while (usedNames.has(safeName)) {
    safeName = `${baseName} ${duplicateIndex}`;
    duplicateIndex += 1;
  }

  usedNames.add(safeName);
  return safeName;
};

const sanitizeRows = (rows) => {
  const usedNames = new Set();
  const columnMap = new Map();

  getColumnNames(rows).forEach((name, index) => {
    columnMap.set(name, getSafeColumnName(name, index, usedNames));
  });

  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [columnMap.get(key), value])
    )
  );
};

const buildColumns = (rows) =>
  getColumnNames(rows).map((name) => ({
    name,
    type: inferColumnType(name, rows)
  }));

const formatNumber = (value) => Number(value.toFixed(2));

export const generateSummary = (columns, rows) => {
  // Keep this compact because it is sent to the AI model on every analysis request.
  const lines = [
    `Row count: ${rows.length}`,
    `Columns: ${columns.map((column) => `${column.name} (${column.type})`).join(', ')}`
  ];

  columns.forEach((column) => {
    const values = rows.map((row) => row[column.name]).filter((value) => !isEmpty(value));

    if (column.type === 'number') {
      const numbers = values.map(Number);
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      const avg = numbers.reduce((total, value) => total + value, 0) / numbers.length;
      lines.push(
        `${column.name}: numeric min=${formatNumber(min)}, max=${formatNumber(max)}, avg=${formatNumber(avg)}`
      );
      return;
    }

    if (column.type === 'string' || column.type === 'boolean' || column.type === 'date') {
      const uniqueValues = new Set(values.map(String));
      lines.push(`${column.name}: ${uniqueValues.size} unique values`);
    }
  });

  return lines.join('\n');
};

export const parseCSV = async (filePath) => {
  const rows = [];
  const stream = fs.createReadStream(filePath).pipe(csv());

  // csv-parser supports async iteration, which keeps parsing flow awaitable.
  for await (const row of stream) {
    rows.push(normalizeRow(row));
  }

  const sanitizedRows = sanitizeRows(rows);
  const columns = buildColumns(sanitizedRows);

  return {
    columns,
    rows: sanitizedRows,
    summary: generateSummary(columns, sanitizedRows)
  };
};

export const parseExcel = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return { columns: [], rows: [], summary: 'Row count: 0\nColumns: ' };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet, { defval: '' }).map(normalizeRow);
  const sanitizedRows = sanitizeRows(rows);
  const columns = buildColumns(sanitizedRows);

  return {
    columns,
    rows: sanitizedRows,
    summary: generateSummary(columns, sanitizedRows)
  };
};

export const parseDataFile = async (file) => {
  const extension = file.originalname.split('.').pop().toLowerCase();

  if (extension === 'csv') {
    return parseCSV(file.path);
  }

  if (['xlsx', 'xls'].includes(extension)) {
    return parseExcel(file.path);
  }

  const error = new Error('Unsupported file type. Upload a CSV, XLS, or XLSX file.');
  error.statusCode = 400;
  throw error;
};

export const getPreviewRows = (rows) => rows.slice(0, PREVIEW_LIMIT);
