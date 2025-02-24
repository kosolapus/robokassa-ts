export enum PaymentObject {
  /**
   * Товар. О реализуемом товаре, за исключением подакцизного товара
   * (наименование и иные сведения, описывающие товар)
   */
  COMMODITY = 'commodity',

  /**
   * Подакцизный товар (наименование и иные сведения, описывающие товар)
   */
  EXCISE = 'excise',

  /**
   * Работа. О выполняемой работе
   */
  JOB = 'job',

  /**
   * Услуга. Об оказываемой услуге
   */
  SERVICE = 'service',

  /**
   * Ставка азартной игры. О приеме ставок при осуществлении деятельности
   * по проведению азартных игр
   */
  GAMBLING_BET = 'gambling_bet',

  /**
   * Выигрыш азартной игры. О выплате денежных средств в виде выигрыша
   * при осуществлении деятельности по проведению азартных игр
   */
  GAMBLING_PRIZE = 'gambling_prize',

  /**
   * Лотерейный билет. О приеме денежных средств при реализации лотерейных
   * билетов, электронных лотерейных билетов, приеме лотерейных ставок
   * при осуществлении деятельности по проведению лотерей
   */
  LOTTERY = 'lottery',

  /**
   * Выигрыш лотереи. О выплате денежных средств в виде выигрыша
   * при осуществлении деятельности по проведению лотерей
   */
  LOTTERY_PRIZE = 'lottery_prize',

  /**
   * Предоставление результатов интеллектуальной деятельности. О предоставлении
   * прав на использование результатов интеллектуальной деятельности или
   * средств индивидуализации
   */
  INTELLECTUAL_ACTIVITY = 'intellectual_activity',

  /**
   * Платеж. Об авансе, задатке, предоплате, кредите, взносе в счет оплаты,
   * пени, штрафе, вознаграждении, бонусе и ином аналогичном предмете расчета
   */
  PAYMENT = 'payment',

  /**
   * Агентское вознаграждение. О вознаграждении пользователя, являющегося
   * платежным агентом (субагентом), банковским платежным агентом (субагентом),
   * комиссионером, поверенным или иным агентом
   */
  AGENT_COMMISSION = 'agent_commission',

  /**
   * Составной предмет расчета. О предмете расчета, состоящем из предметов,
   * каждому из которых может быть присвоено значение выше перечисленных
   * признаков
   */
  COMPOSITE = 'composite',

  /**
   * Курортный сбор
   */
  RESORT_FEE = 'resort_fee',

  /**
   * Иной предмет расчета. О предмете расчета, не относящемуся
   * к выше перечисленным предметам расчета
   */
  ANOTHER = 'another',

  /**
   * Имущественное право
   */
  PROPERTY_RIGHT = 'property_right',

  /**
   * Внереализационный доход
   */
  NON_OPERATING_GAIN = 'non-operating_gain',

  /**
   * Страховые взносы
   */
  INSURANCE_PREMIUM = 'insurance_premium',

  /**
   * Страховые взносы
   */
  SALES_TAX = 'sales_tax',
}
