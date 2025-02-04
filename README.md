# Клиент для платежной системы Robokassa на Typescript

В самом простом случае - позволяет создавать ссылки на оплату 
с заданной суммой.

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

При создании ссылки на оплату/счета можно передавать в качестве 
дополнительного аргумента объект корзины

TBD;

### Валидация корзины

TBD;

## Работа с холдом/предавторизацией

TBD;

### Запрос

TBD;

### Подтвержление

TBD;

#### Можно изменить состав корзины

TBD;

### Отмена

TBD;






