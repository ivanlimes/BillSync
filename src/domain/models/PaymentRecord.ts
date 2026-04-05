import type { BillId, IsoDateString, PaymentId, PaymentType } from '@/domain/types/common';

export interface PaymentRecord {
  id: PaymentId;
  billId: BillId;
  amount: number;
  paymentDate: IsoDateString;
  paymentType: PaymentType;
  notes?: string;
}
