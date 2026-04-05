import type {
  BillClassification,
  BillFrequency,
  BillId,
  BillPriority,
  BillState,
  IsoDateString,
} from '@/domain/types/common';

export interface RecurringBill {
  id: BillId;
  name: string;
  category: string;
  subcategory?: string;
  expectedAmount: number;
  currentCycleActualAmount?: number;
  frequency: BillFrequency;
  nextDueDate: IsoDateString;
  dueRule?: string;
  autopayEnabled: boolean;
  classification: BillClassification;
  priority: BillPriority;
  payerLabel?: string;
  renewalBehavior?: string;
  notes?: string;
  paymentUrl?: string;
  state: BillState;
}
