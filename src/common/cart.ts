import { ReceiptItem } from '../types/receipt';

export class Cart {
  private readonly list: ReceiptItem[];

  constructor() {
    this.list = [];
  }

  validate() {
    if (this.list.length < 1) {
      throw new Error('В чеке должна быть хотя бы одна позиция');
    }

    const hasPositionWithoutName = this.list.some((item) => !item.name);
    if (hasPositionWithoutName) {
      throw new Error('Во всех позициях должно быть указано наименование');
    }

    const hasRestrictedSymbols = this.list.some(
      (item) => item.name.replace(/[\sа-яёa-z0-9,.\-()_]+/gi, '').length > 0
    );
    if (hasRestrictedSymbols) {
      throw new Error(
        'Строка наименования не должна содержать спецсимволов и ' +
          'символов других языков, кроме русского и английского'
      );
    }

    const hasOverLength = this.list.some((item) => item.name.length > 128);
    if (hasOverLength) {
      throw new Error(
        'Входная строка наименования товара длиной не более 128 символов'
      );
    }

    const hasWrongPrice = this.list.some((item) => item.cost < 0);
    if (hasWrongPrice) {
      throw new Error('Цена позиции должна быть больше 0');
    }

    const hasWrongSum = this.list.some((item) => item.sum < 0);

    if (hasWrongSum) {
      throw new Error('Сумма позиции должна быть неотрицательной');
    }
    const hasWrongTotal =
      this.list.reduce((acc, item) => {
        acc += item.sum;
        return acc;
      }, 0) <= 0;

    if (hasWrongTotal) {
      throw new Error('Сумма всех позиций в чеке должна быть больше нуля');
    }
  }

  /**
   *
   * @param item - Новый товар для добавления в корзину
   */
  add(item: ReceiptItem) {
    this.list.push(item);
  }

  /**
   *
   * @param predicate Условие выбора элемента корзины
   * @param partial обновляемая часть
   *
   * @description При обновлении необходимо учитывать, что изначальный тип
   * добавляемого товара остается - это или товар без цены, или товар без суммы.
   * При передаче недопустимого параметра он будет вырезан
   */
  update(
    predicate: (item: ReceiptItem) => boolean,
    partial: Partial<ReceiptItem>
  ) {
    const index = this.list.findIndex(predicate);
    const item = this.list[index];
    if (item.cost) {
      delete partial.sum;
      this.list.splice(index, 1, {
        ...item,
        ...partial,
      } as ReceiptItem);
    }

    if (item.sum !== undefined) {
      delete partial.cost;
      this.list.splice(index, 1, {
        ...item,
        ...partial,
      } as ReceiptItem);
    }
  }

  /**
   *
   * @param predicate Условие выбора элемента корзины
   * @desc Удаляет первый подошедший под условие товар из корзины
   */
  remove(predicate: (item: ReceiptItem) => boolean) {
    const index = this.list.findIndex(predicate);
    this.list.splice(index, 1);
  }

  /**
   * Возвращает текущее состояние корзины
   */
  getList() {
    return this.list;
  }
}
