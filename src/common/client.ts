import { ClientOptions } from '../types/client-options';
import { HashMethod } from '../dict/hash-method';
import {
  CancelHoldDto,
  CreatePaymentBySavedCardDto,
  SignaturePayload,
} from '../types/fields.types';
import { InvoiceType } from '../types/invoice-type';
import { createEncodedPayload, sortCustomFields } from './hash';
import { getErrorByCode } from '../utils/getErrorByCode';
import { createHash } from 'crypto';
import { Language } from '../dict/language';
import { Receipt } from '../types/receipt';
import { XMLParser } from 'fast-xml-parser';

export class RobokassaClient {
  private links = {
    simpleUrl: 'https://auth.robokassa.ru/Merchant',
    xmlUrl: 'https://auth.robokassa.ru/Merchant/WebService/Service.asmx/',
    curl: 'https://auth.robokassa.ru/Merchant/Indexjson.aspx?',
    jwtCreateLink: 'https://services.robokassa.ru/InvoiceServiceWebApi/api',
  };

  private receipt: Receipt;
  private merchant: string;
  private password1: string;
  private password2: string;
  private hashMethod: HashMethod;
  private testMode: boolean;

  private culture: Language;

  constructor({
    merchant,
    password1,
    password2,
    hashMethod = HashMethod.MD5,
    testMode = false,
    culture,
  }: ClientOptions) {
    this.merchant = merchant;
    this.password1 = password1;
    this.password2 = password2;
    this.hashMethod = hashMethod;
    this.testMode = testMode;
    this.culture = culture;
    this.receipt = {
      items: [],
    };
  }

  private buildHashBase = (
    payload: CreatePaymentBySavedCardDto,
    customFields?: string[]
  ) => {
    const parts = [
      this.merchant,
      payload.OutSum,
      payload.InvId || '',
      payload.UserIp,
      payload.Receipt?.items?.length
        ? encodeURIComponent(JSON.stringify(payload.Receipt))
        : undefined,
      payload.StepByStep,
      payload.ResultUrl2,
      payload.Token,
      this.password1,
      ...customFields,
    ];

    return parts.filter((p) => p !== undefined).join(':');
  };

  createInvoiceCurl = async (partial: SignaturePayload) => {
    const {
      InvId,
      UserIp,
      OutSum,
      Culture,
      Receipt,
      Description,
      StepByStep,
      ...customFields
    } = partial;
    const sortedCustomFields = sortCustomFields(customFields);

    const hashBase = this.buildHashBase(partial, sortedCustomFields);

    const sign = createHash(this.hashMethod).update(hashBase).digest('hex');

    const params = new URLSearchParams();

    params.append('MerchantLogin', this.merchant);
    if (OutSum) {
      params.append('OutSum', OutSum.toString());
    }

    params.append('InvId', InvId.toString());
    params.append('Culture', Culture || this.culture || Language.Ru);
    params.append('IsTest', this.testMode ? '1' : '0');
    params.append('Encoding', 'UTF-8');

    if (Receipt) {
      params.append('Receipt', encodeURIComponent(JSON.stringify(Receipt)));
    }

    if (StepByStep) {
      params.append('StepByStep', 'true');
    }

    if (Description) {
      params.append(
        'Description',
        encodeURIComponent(JSON.stringify(Description))
      );
    }

    if (UserIp) {
      params.append('UserIp', UserIp);
    }

    params.append('SignatureValue', sign);

    if (Object.keys(customFields).length > 0) {
      for (const key in customFields) {
        params.append(key, encodeURIComponent(customFields[key]));
      }
    }

    const response = await fetch(this.links.curl, {
      method: 'POST',
      body: params,
    }).then((r) => r.json());

    if (response.errorCode && response.errorCode !== 0) {
      throw new Error(getErrorByCode(response.errorCode));
    }
    return response.invoiceID as string;
  };

  /**
   * Создание ссылки без перенаправления на оплату (curl)
   */
  public async getLinkCurl(partial: SignaturePayload) {
    const invoiceId = await this.createInvoiceCurl(partial);
    return `${this.links.simpleUrl}/Index/${invoiceId}`;
  }

  /**
   * Оплата по сохраненной карте
   */
  public payBySavedCard = async (partial: CreatePaymentBySavedCardDto) => {
    const hashBase = this.buildHashBase(partial);

    const {
      Receipt,
      OutSum,
      StepByStep,
      UserIp,
      InvId,
      Culture,
      Token,
      ResultUrl2,
      Description,
    } = partial;

    const signature = createHash(this.hashMethod)
      .update(hashBase)
      .digest('hex');

    const body = new URLSearchParams({
      MerchantLogin: this.merchant,
      SignatureValue: signature,
      OutSum: OutSum.toString(),
      Token,
      ResultUrl2,
    });

    if (Receipt) {
      body.append('Receipt', encodeURIComponent(JSON.stringify(Receipt)));
    }
    if (StepByStep) {
      body.append('StepByStep', 'true');
    }
    if (UserIp) {
      body.append('UserIp', UserIp);
    }
    if (InvId) {
      body.append('InvId', InvId.toString());
    }
    if (Culture) {
      body.append('Culture', Culture.toString());
    }
    if (Description) {
      body.append('Description', Description);
    }

    return await fetch(`${this.links.simpleUrl}/Payment/CoFPayment?`, {
      method: 'POST',
      body,
    });
  };

  /**
   * Создание ссылки без перенаправления на оплату (JWT)
   */
  public async getLink(
    partial: SignaturePayload,
    invoiceType: InvoiceType,
    comment?: string
  ) {
    const payload = {
      ...partial,
      InvoiceItems: partial.Receipt.items,
      MerchantLogin: this.merchant,
      InvoiceType: invoiceType,
      MerchantComments: comment,
    };

    delete payload.Receipt;

    const header = {
      typ: 'JWT',
      alg: this.hashMethod,
    };

    const hmacKey = `${this.merchant}:${this.password1}`;

    const payloadString = createEncodedPayload(
      hmacKey,
      header,
      payload,
      this.hashMethod
    );

    console.log({
      hmacKey,
      header,
      payload,
      payloadString,
      link: this.links.jwtCreateLink + '/CreateInvoice',
    });

    return await fetch(this.links.jwtCreateLink + '/CreateInvoice', {
      method: 'POST',
      body: payloadString,
    }).then((r) => r.json());
  }

  /**
   *
   * @param InvId <b>EncodedId</b> (Последняя часть ссылки счета) или <b>Id</b>
   * (Идентификатор счета, возвращается в ответе на запрос о создании счета.)
   * или <b>InvId</b> (Номер счета указанный продавцом при создании ссылки. Если
   * продавец не указывал номер счета, то он был сгенерирован автоматически.
   * Возвращается в ответе на запрос о создании счета либо в личном кабинете
   * в разделе "Выставление счетов".)
   *
   * Деактивация созданного счета/ссылки
   */
  public deactivateInvoice = async (InvId: number) => {
    const payload = {
      InvId,
      MerchantLogin: this.merchant,
    };

    const header = {
      typ: 'JWT',
      alg: this.hashMethod,
    };

    const hmacKey = `${this.merchant}:${this.password1}`;

    const payloadString = createEncodedPayload(
      hmacKey,
      header,
      payload,
      this.hashMethod
    );

    return await fetch(this.links.jwtCreateLink + '/DeactivateInvoice', {
      method: 'POST',
      body: payloadString,
    }).then((r) => r.json());
  };

  /**
   * Запрос на списание средств
   */
  requestHold = (payload: SignaturePayload) => {
    return this.getLinkCurl({
      ...payload,
      StepByStep: true,
    });
  };

  /**
   * Подтверждение списания средств
   */
  confirmHold = async (partial: SignaturePayload) => {
    const signatureBase = [
      this.merchant,
      partial.OutSum,
      partial.InvId,
      partial.Receipt,
      this.password1,
    ]
      .filter((f) => f !== undefined)
      .join(':');
    const signature = createHash(this.hashMethod)
      .update(signatureBase)
      .digest('hex');

    const body = new URLSearchParams({
      MerchantLogin: this.merchant,
      InvoiceId: partial.InvId.toString(),
      OutSum: partial.OutSum.toString(),
      SignatureValue: signature,
    });

    return await fetch(`${this.links.simpleUrl}/Payment/Confirm`, {
      method: 'POST',
      body,
    });
  };

  /**
   * Отмена холдирования
   */
  cancelHold = async (payload: CancelHoldDto) => {
    const { InvId, OutSum } = payload;
    const body = new URLSearchParams();
    const signatureBase = this.buildHashBase(
      {
        InvId,
        StepByStep: undefined,
        OutSum: '',
      },
      []
    );

    const signature = createHash(this.hashMethod)
      .update(signatureBase)
      .digest('hex');

    body.append('MerchantLogin', this.merchant);
    body.append('InvoiceId', InvId.toString());
    body.append('SignatureValue', signature);
    body.append('OutSum', OutSum.toString());

    return fetch(`${this.links.simpleUrl}/Payment/Cancel`, {
      method: 'POST',
      body,
    }).then((r) => r.json());
  };

  /**
   * Возвращает список валют, доступных для оплаты заказов указанного
   * магазина (сайта). Используется для указания значений параметра
   * IncCurrLabel, также используется для отображения доступных вариантов
   * оплаты непосредственно на вашем сайте, если вы желаете дать больше
   * информации своим клиентам.
   */
  getCurrencyList = async (lang: Language = Language.Ru) => {
    const body = new URLSearchParams({
      MerchantLogin: this.merchant,
      Language: lang,
    });

    return await fetch(`${this.links.xmlUrl}GetCurrencies`, {
      method: 'POST',
      body,
    }).then(async (r) => {
      const xmlString = await r.text();
      try {
        const parser = new XMLParser({
          ignoreAttributes: false,
        });
        return parser.parse(xmlString)?.CurrenciesList?.Groups;
      } catch (e) {
        throw new Error(e);
      }
    });
  };

  /**
   * Возвращает детальную информацию о текущем состоянии и реквизитах оплаты.
   * Необходимо помнить, что операция инициируется не в момент ухода
   * пользователя на оплату, а позже — после подтверждения его платежных
   * реквизитов, т.е. Вы вполне можете не находить операцию, которая
   * по Вашему мнению уже должна начаться.
   */
  getOperationDetail = async (invoiceId: string | number) => {
    const signature = createHash(this.hashMethod)
      .update(`${this.merchant}:${invoiceId}:${this.password2}`)
      .digest('hex');

    return await fetch(this.links.xmlUrl + 'OpStateExt', {
      method: 'POST',
      body: new URLSearchParams({
        MerchantLogin: this.merchant,
        InvoiceId: invoiceId.toString(),
        Signature: signature,
      }),
    }).then(async (r) => {
      const xmlString = await r.text();
      try {
        const parser = new XMLParser({
          ignoreAttributes: false,
        });
        return parser.parse(xmlString)?.OperationStateResponse;
      } catch (e) {
        throw new Error(e);
      }
    });
  };

  /**
   * Валидация успешного выполнения запроса к ResultURL
   */
  onResultUrl = () => {};
  /**
   * Дополнительное оповещение об успешной оплате позволяет получить
   * уведомление на альтернативный адрес, отличный от указанного
   * в настройках магазина(Result URL). Для операций с холдами на этот адрес
   * направляется уведомление об успешной предавторизации, и это
   * единственный способ его получить.
   */
  onResultUrl2 = () => {};

  /**
   * В случае успешного исполнения платежа Покупатель сможет перейти
   * по адресу, указанному вами в Технических настройках, там же вы
   * указали метод (GET или POST).
   *
   * Переход пользователя по данному адресу с корректными параметрами
   * (правильной Контрольной суммой) означает, что оплата вашего заказа
   * успешно выполнена.
   *
   * Однако для дополнительной защиты желательно, чтобы факт оплаты
   * проверялся скриптом, исполняемым при переходе на SuccessURL, или путем
   * запроса XML-интерфейса получения состояния оплаты счета, и только
   * при реальном наличии счета с номером InvId в базе данных магазина.
   */
  onSuccessUrl = () => {};

  addItem = (payload) => {
    this.receipt.items.push(payload);
  };

  deleteItem = () => {
    this.receipt.items.splice(this.receipt.items.length - 1, 1);
  };

  updateItem = (payload) => {
    this.receipt.items.splice(0, 1, payload);
  };

  getList = () => {
    return this.receipt.items;
  };

  validateReceipt = () => true;
  sendSecondReceipt = () => false;
}
