import { HashMethod } from '../dict/hash-method';
import { Fields } from './fields.types';
import { Language } from '../dict/language';

export type ClientOptions = {
  merchant: Fields['MerchantLogin'];
  password1: string;
  password2: string;
  testMode?: boolean;
  hashMethod?: HashMethod;
  culture?: Language;
};
