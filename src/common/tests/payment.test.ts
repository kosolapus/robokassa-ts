import { RobokassaClient } from '../client';
import { data, testConnection } from '../../../tests/data';
import { HashMethod } from '../../dict/hash-method';

const client = new RobokassaClient(testConnection);

describe('Базовая безопасность', () => {
  test('Клиент без кредов не должен создаться', () => {});
  describe('Создаем клиент с разным шифрованием', () => {
    for (const method in HashMethod) {
      test(`Клиент с шифрованием '${method}'`, () => {
        const client = new RobokassaClient({
          ...testConnection,
          hashMethod: HashMethod[method],
        });
        expect(client).toBeDefined();
      });
    }
  });
});

describe('Создание платежной ссылки в разных конфигурациях', () => {
  test('Простая ссылка на оплату', async () => {
    const result = await client.getLinkCurl({
      InvId: 1,
      Description: 'Просто ссылка',
      UserIp: data.UserIp,
      OutSum: data.OutSum,
    });
    console.log('Просто ссылка', result);
  });

  test('Ссылка на оплату с кастомными полями', async () => {
    const result = await client.getLinkCurl({
      InvId: 2,
      OutSum: 3,
      UserIp: data.UserIp,
      Description: 'Кастомные поля',
      Shp_field: 'кастомное поле 1',
    });
    console.log('кастомные поля', result);
  });

  test('Ссылка на оплату с кастомными полями без сортировки', async () => {
    const result = await client.getLinkCurl({
      InvId: 3,
      OutSum: 3,
      UserIp: data.UserIp,
      Description: 'Кастомные поля',
      Shp_field: 'кастомное поле 1',
      Shp_c: 'кастомное поле 1',
      Shp_a: 'кастомное поле 1',
      Shp_b: 'кастомное поле 1',
    });
    console.log('кастомные поля без сортировки', result);
  });

  test('Ссылка на оплату с чеком', async () => {
    const result = await client.getLinkCurl({
      InvId: 4,
      OutSum: 72,
      UserIp: data.UserIp,
      Receipt: data.Receipt,
    });
    console.log('С чеком:', result);
  });

  test('Ссылка на оплату без необходимых полей', () => {});

  test('Платеж по сохраненной карте', async () => {
    const result = await client.payBySavedCard({
      ...data,
      ResultUrl2: 'https://google.com',
      Token: '12',
    });

    console.log(result);
  });
});

describe('Работа с XML', () => {
  test('Список валют с методами платежа', async () => {
    const result = await client.getCurrencyList();
    console.log(result);
  });
});

describe('Работа со счетами', () => {
  test('Создание многоразового счета', async () => {
    const result = await client.getLink(
      {
        InvId: 4,
        OutSum: 12,
        Receipt: data.Receipt,
      },
      'Reusable',
      'Счет на оплату JWT'
    );

    console.log(result);
  });

  test('Создание одноразового счета', async () => {
    const result = await client.getLink(
      {
        InvId: 4,
        OutSum: 12,
        Receipt: data.Receipt,
      },
      'OneTime',
      'Счет на оплату JWT'
    );

    console.log(result);
  });

  test('Запрос на отмену счета', async () => {
    const result = await client.deactivateInvoice(4);
    console.log(result);
  });

  test('Проверка состояния счета', async () => {
    await client.createInvoiceCurl({
      InvId: 5,
      OutSum: 3,
    });

    const result = await client.getOperationDetail(5);
    console.log(result);
  });
});

describe('Работа с холдом/предавторизацией', () => {
  test('Запрос холда', async () => {
    const invoiceId = await client.requestHold({
      InvId: 6,
      OutSum: 3,
      StepByStep: true,
    });

    console.log(invoiceId);
  });

  test('Отмена холда', async () => {
    const result = await client.cancelHold({
      InvId: 6,
      OutSum: 3,
    });

    console.log(result);
  });

  describe('Подтверждение холда', () => {
    test('Подтверждение с той же суммой', async () => {
      const result = await client.confirmHold({
        InvId: 6,
        OutSum: 3,
      });

      console.log(result);
    });

    test('Подтверждение с другой суммой', async () => {
      const result = await client.confirmHold({
        InvId: 6,
        OutSum: data.OutSum,
        Receipt: data.Receipt,
      });

      console.log(result);
    });
  });
});

describe('Технические ограничения', () => {
  describe('Создание подписи для различных методов шифрования и различных наборов параметров', () => {
    for (const method in HashMethod) {
      // todo: нужен кросс-тест со всеми вариантами создания подписи
    }
  });
});

describe('Выполнение правил фискализации', () => {
  test('В чеке есть хотя бы одна позиция', () => {});
  test('Во всех позициях указано наименование', () => {});
  test('Строка наименования не должна содержать спецсимволов и символов других языков, кроме русского и английского', () => {});
  test('Входная строка наименования товара длиной не более 128 символов, более длинные строки будут обрезаны', () => {});
  test('Цена позиции не отрицательная', () => {});
  test('Сумма позиции не отрицательная', () => {});
  test('Общая сумма всех позиций больше нуля', () => {});
  test('Сумма всех позиций в чеке должна быть равна сумме операции', () => {});
});
