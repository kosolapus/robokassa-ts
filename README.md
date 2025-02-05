# Клиент для платежной системы Robokassa на Typescript

Работает 2 способами:
1. Создание простой ссылки на оплату
2. Создание ссылки на оплату корзины

```typescript
const client = new RobokassaClient({
  merchant: 'merchant', // идентификатор магазина
  // testMode: true, // для запуска в тестовом режиме, часть методов не работает
  password1: 'pass1',
  password2: 'pass2',
  hashMethod: HashMethod.MD5,
})
```

## Получение ссылки на оплату (curl)

```typescript
const result = await client.getLinkCurl({
      InvId: 1,
      Description: 'Просто ссылка',
      UserIp: '127.0.0.1',
      OutSum: 12.3,
    });
```

Возможно передавать кастомные поля

```typescript
const result = await client.getLinkCurl({
      InvId: 3,
      OutSum: 3,
      Description: 'Кастомные поля',
      Shp_field: 'кастомное поле 1',
      Shp_c: 'кастомное поле 1',
      Shp_a: 'кастомное поле 1',
      Shp_b: 'кастомное поле 1',
    });
```

## Получение ссылки на оплату (jwt)

**Не работает в тестовом режиме**

TBD;

## Работа с корзиной

Корзина - это такое же создание ссылки на оплату, только 
с валидацией состава в соответствии с требованиями платежной системы.

```typescript

const item: ReceiptItem = {
  name: 'Товар без цены',
  sum: 36,
  quantity: 3,
  payment_method: PaymentMethod.FULL_PAYMENT,
  payment_object: PaymentObject.SERVICE,
  nomenclature_code: '04620034587218',
  tax: TaxSize.NONE,
};

// Добавление товара
client.addItem(item);

// Обновляем первый попавшийся по предикату
client.updateItem(
  (item) => item.nomenclature_code === item.nomenclature_code,
  {
    quantity: 22,
  }
);

// Удаление - аналогично
client.deleteItem(
  (item) => item.nomenclature_code === item.nomenclature_code
);

// После обработки корзины - создаем ссылку на оплату
const result = await client.getCartLink({
  OutSum: 1, // Сумма должна совпадать с суммой всех позиций корзины
  // Так же можно дополнить параметрами для обычной ссылки
  InvId: 3
});

// Необязательный аргумент - система налогообложения Tax
// Применим, когда магазин имеет больше 1 системы налогообложения
const resultWithTax = await client.getCartLink({
  OutSum: 1, // Сумма должна совпадать с суммой всех позиций корзины
  // Так же можно дополнить параметрами для обычной ссылки
  InvId: 3
}, Tax.ESN);


```

## Работа с холдом/предавторизацией

TBD;

### Запрос

TBD;

### Подтверждение

TBD;

#### Можно изменить состав корзины

TBD;

### Отмена

TBD;






