import { Errors } from '../dict/errors';

export const getErrorByCode = (code: number) => {
  for (const name in Errors) {
    if (Errors[name].toString() === code.toString()) {
      return name;
    }
  }
  return `Error not implemented: ${code}`;
};
