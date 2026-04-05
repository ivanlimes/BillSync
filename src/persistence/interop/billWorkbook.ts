import type { WorkSheet } from 'xlsx';

type XlsxModule = typeof import('xlsx');
import type {
  BillClassification,
  BillFrequency,
  BillPriority,
  BillState,
  RecurringBill,
} from '../../domain';
import type { AppState } from '../../store/state';
import { upsertEntity } from '../../store/utils/entityState';
import { toIsoDate } from '../../utils/date';

const BILL_SHEET_NAME = 'Bills';
const EXPORT_FILE_NAME = 'family-monthly-bills-bills.xlsx';

const BILL_FREQUENCIES: readonly BillFrequency[] = ['monthly', 'quarterly', 'semiannual', 'annual', 'custom'];
const BILL_CLASSIFICATIONS: readonly BillClassification[] = ['fixed', 'variable'];
const BILL_PRIORITIES: readonly BillPriority[] = ['essential', 'optional'];
const BILL_STATES: readonly BillState[] = ['active', 'archived'];

type BillWorkbookColumnKey =
  | 'id'
  | 'name'
  | 'category'
  | 'subcategory'
  | 'expectedAmount'
  | 'currentCycleActualAmount'
  | 'frequency'
  | 'nextDueDate'
  | 'dueRule'
  | 'autopayEnabled'
  | 'classification'
  | 'priority'
  | 'payerLabel'
  | 'renewalBehavior'
  | 'notes'
  | 'paymentUrl'
  | 'state';

interface BillWorkbookColumn {
  key: BillWorkbookColumnKey;
  header: string;
  exportValue: (bill: RecurringBill) => string | number | boolean | null;
}

const BILL_WORKBOOK_COLUMNS: readonly BillWorkbookColumn[] = [
  { key: 'id', header: 'Bill ID', exportValue: (bill) => bill.id },
  { key: 'name', header: 'Bill Name', exportValue: (bill) => bill.name },
  { key: 'category', header: 'Category', exportValue: (bill) => bill.category },
  { key: 'subcategory', header: 'Subcategory', exportValue: (bill) => bill.subcategory ?? null },
  { key: 'expectedAmount', header: 'Expected Amount', exportValue: (bill) => bill.expectedAmount },
  {
    key: 'currentCycleActualAmount',
    header: 'Current Cycle Actual Amount',
    exportValue: (bill) => bill.currentCycleActualAmount ?? null,
  },
  { key: 'frequency', header: 'Frequency', exportValue: (bill) => bill.frequency },
  { key: 'nextDueDate', header: 'Next Due Date', exportValue: (bill) => bill.nextDueDate },
  { key: 'dueRule', header: 'Due Rule', exportValue: (bill) => bill.dueRule ?? null },
  { key: 'autopayEnabled', header: 'AutoPay Enabled', exportValue: (bill) => bill.autopayEnabled },
  { key: 'classification', header: 'Classification', exportValue: (bill) => bill.classification },
  { key: 'priority', header: 'Priority', exportValue: (bill) => bill.priority },
  { key: 'payerLabel', header: 'Payer Label', exportValue: (bill) => bill.payerLabel ?? null },
  { key: 'renewalBehavior', header: 'Renewal Behavior', exportValue: (bill) => bill.renewalBehavior ?? null },
  { key: 'notes', header: 'Notes', exportValue: (bill) => bill.notes ?? null },
  { key: 'paymentUrl', header: 'Payment URL', exportValue: (bill) => bill.paymentUrl ?? null },
  { key: 'state', header: 'State', exportValue: (bill) => bill.state },
];

const NORMALIZED_HEADER_TO_KEY = new Map<string, BillWorkbookColumnKey>([
  ['billid', 'id'],
  ['id', 'id'],
  ['billname', 'name'],
  ['name', 'name'],
  ['category', 'category'],
  ['subcategory', 'subcategory'],
  ['expectedamount', 'expectedAmount'],
  ['expected', 'expectedAmount'],
  ['currentcycleactualamount', 'currentCycleActualAmount'],
  ['actualamount', 'currentCycleActualAmount'],
  ['frequency', 'frequency'],
  ['nextduedate', 'nextDueDate'],
  ['duedate', 'nextDueDate'],
  ['duerule', 'dueRule'],
  ['autopayenabled', 'autopayEnabled'],
  ['autopay', 'autopayEnabled'],
  ['classification', 'classification'],
  ['priority', 'priority'],
  ['payerlabel', 'payerLabel'],
  ['payer', 'payerLabel'],
  ['renewalbehavior', 'renewalBehavior'],
  ['renewal', 'renewalBehavior'],
  ['notes', 'notes'],
  ['paymenturl', 'paymentUrl'],
  ['paymentlink', 'paymentUrl'],
  ['state', 'state'],
  ['status', 'state'],
]);

interface NormalizedRow {
  rowNumber: number;
  cells: Partial<Record<BillWorkbookColumnKey, unknown>>;
}

export interface BillWorkbookImportWarning {
  rowNumber: number;
  message: string;
}

export interface BillWorkbookImportSummary {
  processedRows: number;
  updatedCount: number;
  addedCount: number;
  skippedCount: number;
  warnings: BillWorkbookImportWarning[];
}

export interface BillWorkbookImportResult {
  nextState: AppState;
  summary: BillWorkbookImportSummary;
}

function normalizeHeader(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function isRowEmpty(cells: Partial<Record<BillWorkbookColumnKey, unknown>>) {
  return Object.values(cells).every((value) => {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string') {
      return value.trim().length === 0;
    }

    return false;
  });
}

function normalizeRows(sheet: WorkSheet, xlsx: XlsxModule) {
  const rawRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: true,
  });

  return rawRows
    .map((rawRow: Record<string, unknown>, index: number) => {
      const cells: Partial<Record<BillWorkbookColumnKey, unknown>> = {};

      for (const [header, value] of Object.entries(rawRow)) {
        const key = NORMALIZED_HEADER_TO_KEY.get(normalizeHeader(header));

        if (key) {
          cells[key] = value;
        }
      }

      return {
        rowNumber: index + 2,
        cells,
      };
    })
    .filter((row: NormalizedRow) => !isRowEmpty(row.cells));
}

function parseStringCell(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }

  if (value instanceof Date) {
    return toIsoDate(value);
  }

  return '';
}

function parseOptionalStringCell(value: unknown) {
  const nextValue = parseStringCell(value);
  return nextValue.length > 0 ? nextValue : undefined;
}

function parseNumberCell(value: unknown, fieldLabel: string, rowNumber: number, options?: { allowBlank?: boolean }) {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0)) {
    if (options?.allowBlank) {
      return undefined;
    }

    throw new Error(`${fieldLabel} is required.`);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(`${fieldLabel} must be a valid number.`);
    }

    return value;
  }

  const normalized = parseStringCell(value).replace(/[$,\s]/g, '');
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldLabel} must be a valid number in row ${rowNumber}.`);
  }

  return parsed;
}

function parseBooleanCell(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  const normalized = parseStringCell(value).toLowerCase();

  if (normalized.length === 0) {
    return false;
  }

  return ['true', 'yes', 'y', '1', 'on'].includes(normalized);
}

function excelSerialToIsoDate(serial: number) {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const parsedDate = new Date(utcValue * 1000);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('Date value could not be parsed.');
  }

  return toIsoDate(parsedDate);
}

function parseDateCell(value: unknown, fieldLabel: string) {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0)) {
    throw new Error(`${fieldLabel} is required.`);
  }

  if (value instanceof Date) {
    return toIsoDate(value);
  }

  if (typeof value === 'number') {
    try {
      return excelSerialToIsoDate(value);
    } catch {
      throw new Error(`${fieldLabel} must be a valid date.`);
    }
  }

  const normalized = parseStringCell(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  const timestamp = Date.parse(normalized);

  if (Number.isNaN(timestamp)) {
    throw new Error(`${fieldLabel} must be a valid date.`);
  }

  return toIsoDate(new Date(timestamp));
}

function parseEnumCell<TValue extends string>(
  value: unknown,
  allowedValues: readonly TValue[],
  fieldLabel: string,
  fallback: TValue,
) {
  const normalized = parseStringCell(value).toLowerCase();

  if (normalized.length === 0) {
    return fallback;
  }

  const match = allowedValues.find((allowedValue) => allowedValue.toLowerCase() === normalized);

  if (!match) {
    throw new Error(`${fieldLabel} must be one of: ${allowedValues.join(', ')}.`);
  }

  return match;
}

function createImportedBillId() {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return `bill_${cryptoApi.randomUUID()}`;
  }

  return `bill_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createBillNameIndex(state: AppState) {
  const nameIndex = new Map<string, RecurringBill>();

  for (const billId of state.entities.bills.allIds) {
    const bill = state.entities.bills.byId[billId];

    if (!bill) {
      continue;
    }

    nameIndex.set(bill.name.trim().toLowerCase(), bill);
  }

  return nameIndex;
}

function buildImportedBill(
  state: AppState,
  row: NormalizedRow,
  nameIndex: Map<string, RecurringBill>,
): { bill: RecurringBill; mode: 'updated' | 'added' } {
  const idFromSheet = parseOptionalStringCell(row.cells.id);
  const nameFromSheet = parseOptionalStringCell(row.cells.name);
  const existingById = idFromSheet ? state.entities.bills.byId[idFromSheet] : undefined;
  const existingByName = !existingById && nameFromSheet ? nameIndex.get(nameFromSheet.trim().toLowerCase()) : undefined;
  const existingBill = existingById ?? existingByName;

  const baseBill: RecurringBill = existingBill
    ? { ...existingBill }
    : {
        id: idFromSheet ?? createImportedBillId(),
        name: '',
        category: '',
        expectedAmount: 0,
        frequency: 'monthly',
        nextDueDate: '',
        autopayEnabled: false,
        classification: 'fixed',
        priority: 'essential',
        state: 'active',
      };

  if ('name' in row.cells) {
    const name = parseStringCell(row.cells.name);

    if (name.length === 0) {
      throw new Error('Bill Name is required.');
    }

    baseBill.name = name;
  } else if (!existingBill) {
    throw new Error('Bill Name column is required for new bills.');
  }

  if ('category' in row.cells) {
    const category = parseStringCell(row.cells.category);

    if (category.length === 0) {
      throw new Error('Category is required.');
    }

    baseBill.category = category;
  } else if (!existingBill) {
    throw new Error('Category column is required for new bills.');
  }

  if ('subcategory' in row.cells) {
    baseBill.subcategory = parseOptionalStringCell(row.cells.subcategory);
  }

  if ('expectedAmount' in row.cells) {
    const expectedAmount = parseNumberCell(row.cells.expectedAmount, 'Expected Amount', row.rowNumber);

    if (expectedAmount === undefined) {
      throw new Error('Expected Amount is required.');
    }

    baseBill.expectedAmount = expectedAmount;
  } else if (!existingBill) {
    throw new Error('Expected Amount column is required for new bills.');
  }

  if ('currentCycleActualAmount' in row.cells) {
    baseBill.currentCycleActualAmount = parseNumberCell(
      row.cells.currentCycleActualAmount,
      'Current Cycle Actual Amount',
      row.rowNumber,
      { allowBlank: true },
    );
  }

  if ('frequency' in row.cells) {
    baseBill.frequency = parseEnumCell(row.cells.frequency, BILL_FREQUENCIES, 'Frequency', baseBill.frequency);
  }

  if ('nextDueDate' in row.cells) {
    baseBill.nextDueDate = parseDateCell(row.cells.nextDueDate, 'Next Due Date');
  } else if (!existingBill) {
    throw new Error('Next Due Date column is required for new bills.');
  }

  if ('dueRule' in row.cells) {
    baseBill.dueRule = parseOptionalStringCell(row.cells.dueRule);
  }

  if ('autopayEnabled' in row.cells) {
    baseBill.autopayEnabled = parseBooleanCell(row.cells.autopayEnabled);
  }

  if ('classification' in row.cells) {
    baseBill.classification = parseEnumCell(
      row.cells.classification,
      BILL_CLASSIFICATIONS,
      'Classification',
      baseBill.classification,
    );
  }

  if ('priority' in row.cells) {
    baseBill.priority = parseEnumCell(row.cells.priority, BILL_PRIORITIES, 'Priority', baseBill.priority);
  }

  if ('payerLabel' in row.cells) {
    baseBill.payerLabel = parseOptionalStringCell(row.cells.payerLabel);
  }

  if ('renewalBehavior' in row.cells) {
    baseBill.renewalBehavior = parseOptionalStringCell(row.cells.renewalBehavior);
  }

  if ('notes' in row.cells) {
    baseBill.notes = parseOptionalStringCell(row.cells.notes);
  }

  if ('paymentUrl' in row.cells) {
    baseBill.paymentUrl = parseOptionalStringCell(row.cells.paymentUrl);
  }

  if ('state' in row.cells) {
    baseBill.state = parseEnumCell(row.cells.state, BILL_STATES, 'State', baseBill.state);
  }

  return {
    bill: baseBill,
    mode: existingBill ? 'updated' : 'added',
  };
}

export async function exportBillsWorkbook(state: AppState) {
  const XLSX = await import('xlsx');
  const bills = state.entities.bills.allIds
    .map((billId) => state.entities.bills.byId[billId])
    .filter((bill): bill is RecurringBill => Boolean(bill));

  const rows = bills.map((bill) => {
    return BILL_WORKBOOK_COLUMNS.reduce<Record<string, string | number | boolean | null>>((row, column) => {
      row[column.header] = column.exportValue(bill);
      return row;
    }, {});
  });

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: BILL_WORKBOOK_COLUMNS.map((column) => column.header),
  });

  if (rows.length === 0) {
    XLSX.utils.sheet_add_aoa(worksheet, [BILL_WORKBOOK_COLUMNS.map((column) => column.header)]);
  }

  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 24 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 24 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 28 },
    { wch: 28 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, BILL_SHEET_NAME);
  XLSX.writeFile(workbook, EXPORT_FILE_NAME);
}

export async function importBillsWorkbook(file: File, currentState: AppState): Promise<BillWorkbookImportResult> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: 'array',
    cellDates: true,
  });

  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('The workbook does not contain any sheets.');
  }

  const sheet = workbook.Sheets[firstSheetName];

  if (!sheet) {
    throw new Error('The workbook could not be read.');
  }

  const rows = normalizeRows(sheet, XLSX);
  const nameIndex = createBillNameIndex(currentState);
  let nextBills = currentState.entities.bills;
  const warnings: BillWorkbookImportWarning[] = [];
  let updatedCount = 0;
  let addedCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    try {
      const imported = buildImportedBill(currentState, row, nameIndex);
      nextBills = upsertEntity(nextBills, imported.bill);
      nameIndex.set(imported.bill.name.trim().toLowerCase(), imported.bill);

      if (imported.mode === 'updated') {
        updatedCount += 1;
      } else {
        addedCount += 1;
      }
    } catch (error) {
      skippedCount += 1;
      warnings.push({
        rowNumber: row.rowNumber,
        message: error instanceof Error ? error.message : 'Row could not be imported.',
      });
    }
  }

  return {
    nextState: {
      ...currentState,
      entities: {
        ...currentState.entities,
        bills: nextBills,
      },
      ui: {
        ...currentState.ui,
        activeDestination: 'settings',
      },
    },
    summary: {
      processedRows: rows.length,
      updatedCount,
      addedCount,
      skippedCount,
      warnings,
    },
  };
}
