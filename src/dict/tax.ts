export enum Tax {
  OSN = 'osn',
  USN_INCOME = 'usn_income',
  USN_INCOME_OUTCOME = 'usn_income_outcome',
  ESN = 'esn',
  PATENT = 'patent',
}

export enum TaxSize {
  // Без НДС.
  NONE = 'none',

  // НДС по ставке 0%
  VAT0 = 'vat0',

  // НДС чека по ставке 10%
  VAT10 = 'vat10',

  // НДС чека по расчетной ставке 10/110
  VAT110 = 'vat110',

  // НДС чека по ставке 20%
  VAT20 = 'vat20',

  // НДС чека по расчетной ставке 20/120
  VAT120 = 'vat120',

  // НДС по ставке 5%
  VAT5 = 'vat5',

  //– НДС по ставке 7%
  VAT7 = 'vat7',

  //– НДС чека по расчетной ставке 5/105
  VAT105 = 'vat105',

  //– НДС чека по расчетной ставке 7/107
  VAT107 = 'vat107',
}
