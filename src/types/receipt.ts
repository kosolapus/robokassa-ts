import { Tax, TaxSize, PaymentMethod, PaymentObject } from '../dict';

export type ReceiptItemWithoutSum = {
  cost: number;
  sum?: never;
};

export type ReceiptItemWithSum = {
  sum: number;
  cost?: never;
};

export type ReceiptItem = (ReceiptItemWithSum | ReceiptItemWithoutSum) & {
  name: string;
  quantity: number;
  payment_method: PaymentMethod;
  payment_object: PaymentObject;
  tax: TaxSize;
  nomenclature_code: string;
};

export type Receipt = {
  sno?: Tax;
  // todo: ошибка в документации? Там отмечен как плоский массив
  items: ReceiptItem[];
};
