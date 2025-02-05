import { RobokassaClient } from '../client';
import { data, testConnection } from '../../../tests/data';
import { HashMethod, Tax } from '../../dict';

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
    expect(result).toMatch('https://auth.robokassa.ru/Merchant/Index/');
  });

  test('Ссылка на оплату с кастомными полями', async () => {
    const result = await client.getLinkCurl({
      InvId: 2,
      OutSum: 3,
      UserIp: data.UserIp,
      Description: 'Кастомные поля',
      Shp_field: 'кастомное поле 1',
    });
    expect(result).toMatch('https://auth.robokassa.ru/Merchant/Index/');
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
    expect(result).toMatch('https://auth.robokassa.ru/Merchant/Index/');
  });

  test('Ссылка на оплату с чеком', async () => {
    const result = await client.getLinkCurl({
      InvId: 4,
      OutSum: 72,
      UserIp: data.UserIp,
      Receipt: data.Receipt,
    });
    expect(result).toMatch('https://auth.robokassa.ru/Merchant/Index/');
  });

  test('Ссылка на оплату без необходимых полей', () => {});

  test('Платеж по сохраненной карте', async () => {
    const result = await client.payBySavedCard({
      ...data,
      ResultUrl2: 'https://google.com',
      Token: '12',
    });

    expect(result.status).toBe(200);
  });
});

describe('Работа с XML', () => {
  test('Список валют с методами платежа', async () => {
    const result = await client.getCurrencyList();
    expect('Group' in result).toBe(true);
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

    expect(result.status).toBe(415); // Не работает в тестовом режиме!
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

    expect(result.status).toBe(415); // Не работает в тестовом режиме!
  });

  test('Запрос на отмену счета', async () => {
    const result = await client.deactivateInvoice(4);
    expect(result.status).toBe(415); // Не работает в тестовом режиме!
  });

  test('Проверка состояния счета', async () => {
    await client.createInvoiceCurl({
      InvId: 5,
      OutSum: 3,
    });

    const result = await client.getOperationDetail(999);
    expect(result.Result.Code).toBe(3);
  });
});

describe('Работа с холдом/предавторизацией', () => {
  test('Запрос холда', async () => {
    await expect(async () => {
      await client.requestHold({
        InvId: 6,
        OutSum: 3,
        StepByStep: true,
      });
    }).rejects.toThrow('HOLD_UNAVAILABLE');
  });

  test('Отмена холда', async () => {
    const result = await client.cancelHold({
      InvId: 6,
      OutSum: 3,
    });

    expect(result.success).toBeFalsy();
  });

  describe('Подтверждение холда', () => {
    test('Подтверждение с той же суммой', async () => {
      const result = await client.confirmHold({
        InvId: 6,
        OutSum: 3,
      });

      expect(result.status).toBe(200);
    });

    test('Подтверждение с другой суммой', async () => {
      const result = await client.confirmHold({
        InvId: 6,
        OutSum: data.OutSum,
        Receipt: data.Receipt,
      });

      expect(result.status).toBe(200);
    });
  });
});

describe('Выполнение правил фискализации', () => {
  test('В чеке есть хотя бы одна позиция', async () => {
    client.clearCart();
    await expect(async () => {
      await client.getCartLink(
        {
          InvId: 4,
          OutSum: 12,
        },
        Tax.OSN
      );
    }).rejects.toThrow('В чеке должна быть хотя бы одна позиция');
  });

  test('Во всех позициях указано наименование', async () => {
    client.clearCart();
    const itemWithoutName = data.Receipt.items[0];
    delete itemWithoutName.name;
    client.addItem(itemWithoutName);

    await expect(async () => {
      await client.getCartLink(
        {
          InvId: 4,
          OutSum: 12,
        },
        Tax.OSN
      );
    }).rejects.toThrow('Во всех позициях должно быть указано наименование');
  });
  test('Строка наименования не должна содержать спецсимволов', async () => {
    client.clearCart();
    const wrongItem = data.Receipt.items[0];
    wrongItem.name = 'Sdasd1###%$12';
    client.addItem(wrongItem);

    await expect(async () => {
      await client.getCartLink(
        {
          InvId: 4,
          OutSum: 12,
        },
        Tax.OSN
      );
    }).rejects.toThrow('Строка наименования не должна содержать спецсимволов');
  });

  test('Наименование не более 128 символов', async () => {
    client.clearCart();
    const wrongItem = data.Receipt.items[0];
    wrongItem.name = Array.from({ length: 200 })
      .map(() => 'a')
      .join('');
    client.addItem(wrongItem);

    await expect(async () => {
      await client.getCartLink(
        {
          InvId: 4,
          OutSum: 12,
        },
        Tax.OSN
      );
    }).rejects.toThrow(
      'Входная строка наименования товара длиной не более 128 символов'
    );
  });

  test('Цена позиции не отрицательная', async () => {
    client.clearCart();
    const wrongItem = data.Receipt.items[0];
    wrongItem.cost = -3;
    client.addItem(wrongItem);

    await expect(async () => {
      await client.getCartLink(
        {
          InvId: 4,
          OutSum: 12,
        },
        Tax.OSN
      );
    }).rejects.toThrow(
      'Входная строка наименования товара длиной не более 128 символов'
    );
  });

  test('Сумма позиции не отрицательная', async () => {
    client.clearCart();
    const wrongItem = data.Receipt.items[1];
    wrongItem.sum = -3;
    client.addItem(wrongItem);

    await expect(async () => {
      await client.getCartLink(
        {
          InvId: 4,
          OutSum: 12,
        },
        Tax.OSN
      );
    }).rejects.toThrow('Сумма позиции должна быть неотрицательной');
  });
  test('Общая сумма всех позиций больше нуля', async () => {
    client.clearCart();
    const wrongItem = data.Receipt.items[1];
    wrongItem.sum = 0;
    client.addItem(wrongItem);
    client.addItem(wrongItem);

    await expect(async () => {
      await client.getCartLink(
        {
          InvId: 4,
          OutSum: 12,
        },
        Tax.OSN
      );
    }).rejects.toThrow('Сумма всех позиций в чеке должна быть больше нуля');
  });
  test('Сумма позиций в чеке должна быть равна сумме операции', async () => {
    client.clearCart();
    const wrongItem = data.Receipt.items[1];
    wrongItem.sum = 1;
    client.addItem(wrongItem);

    await expect(async () => {
      await client.getCartLink(
        {
          InvId: 4,
          OutSum: 2,
        },
        Tax.OSN
      );
    }).rejects.toThrow(
      'Сумма всех позиций в чеке должна быть равна сумме операции'
    );
  });

  test('товар в корзине обновляется успешно', async () => {
    client.clearCart();
    const item = data.Receipt.items[1];
    client.addItem(item);

    client.updateItem(
      (item) => item.nomenclature_code === item.nomenclature_code,
      {
        quantity: 22,
      }
    );

    const items = client.getList();
    expect(items[0].quantity).toBe(22);
  });

  test('Товар удаляется из корзины', async () => {
    client.clearCart();
    const item = data.Receipt.items[1];
    client.addItem(item);

    client.deleteItem(
      (item) => item.nomenclature_code === item.nomenclature_code
    );

    const items = client.getList();
    expect(items.length).toBe(0);
  });

  test('Нормальная операция возвращает ссылку на оплату', async () => {
    client.clearCart();
    const item = data.Receipt.items[1];
    item.sum = 1;
    client.addItem(item);

    const result = await client.getCartLink({
      OutSum: 1,
    });

    expect(result).toMatch('https://auth.robokassa.ru/Merchant/Index/');
  });
});
