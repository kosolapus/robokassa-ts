import { SignaturePayload } from '../src/types/fields.types';
import 'dotenv/config';
import { HashMethod } from '../src/dict/hash-method';
import { ClientOptions } from '../src/types/client-options';
import { Receipt, ReceiptItem } from '../src/types/receipt';
import { PaymentMethod } from '../src/dict/payment-method';
import { PaymentObject } from '../src/dict/payment-object';
import { TaxSize } from '../src/dict/tax';

export const receiptItemWithoutSum: ReceiptItem = {
  name: 'Товар без суммы',
  cost: 12,
  quantity: 3,
  payment_method: PaymentMethod.FULL_PREPAYMENT,
  payment_object: PaymentObject.COMMODITY,
  nomenclature_code: '04620034587217',
  tax: TaxSize.VAT5,
};

export const receiptItemWithSum: ReceiptItem = {
  name: 'Товар без цены',
  sum: 36,
  quantity: 3,
  payment_method: PaymentMethod.FULL_PAYMENT,
  payment_object: PaymentObject.SERVICE,
  nomenclature_code: '04620034587218',
  tax: TaxSize.NONE,
};

export const testReceipt: Receipt = {
  items: [receiptItemWithoutSum, receiptItemWithSum],
};

export const data: SignaturePayload = {
  InvId: 1,
  OutSum: 72,
  UserIp: '127.0.0.1',
  Receipt: testReceipt,
  Description: 'Тестовая покупка',
  shp_beta: 123,
  Shp_alpha: 123,
  shp_custom: 'Кириллица',
  SHP_delta: '4',
};

export const testConnection: ClientOptions = {
  merchant: process.env.MERCHANT,
  testMode: true,
  password1: process.env.TEST_PASS_1,
  password2: process.env.TEST_PASS_2,
  hashMethod: HashMethod.MD5,
};
