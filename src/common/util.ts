import { init } from '@paralleldrive/cuid2'
import crypto from 'crypto';

const serviceInstances = new Map();

export const getService = <T>(ServiceClass: new () => T): T => {
  const className = ServiceClass.name;
  const instance = serviceInstances.get(className) || serviceInstances.set(className, new ServiceClass()).get(className);
  return instance;
}

export const objectToQueryString = (params: Record<string, any>): string => {
  return Object.keys(params)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    .join('&');
};

export const getUniqueCode = (length: number, type: "number" | "alphanumeric" = 'alphanumeric', prefix: string = "") => {
  let code: number | string;
  if(type !== "number"){
    const createId = init({ length });
    code = createId()?.toString();
  } else {
    const timestamp = Date.now() % (10 ** (length - 3));
    const randomComponent = parseInt(crypto.randomBytes(2).toString('hex'), 16) % 1000;
    const uniqueNumber = timestamp * 1000 + randomComponent;
    code = parseInt(String(uniqueNumber));
  }

  return `${prefix}${code}`;
}

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));