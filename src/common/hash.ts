import { CustomFields } from '../types/fields.types';
import { HashMethod } from '../dict/hash-method';
import { createHmac } from 'crypto';

export const sortCustomFields = (customFields: CustomFields): string[] => {
  return Object.keys(customFields)
    .sort((a, b) => {
      const aName = a.replace(/^shp_/i, '');
      const bName = b.replace(/^shp_/i, '');
      return aName.localeCompare(bName);
    })
    .map((key) => `${key}=${encodeURI(customFields[key])}`);
};

export const createEncodedPayload = (
  key: string,
  header: Record<string, any>,
  payload: Record<string, any>,
  hashMethod: HashMethod = HashMethod.MD5
) => {
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64');

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64'
  );
  const signatureBase = `${encodedHeader}.${encodedPayload}`;

  const signature = createHmac(hashMethod, key)
    .update(signatureBase)
    .digest('base64');

  return `${signatureBase}.${signature}`;
};
