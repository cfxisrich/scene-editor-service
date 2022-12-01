import { Logger } from '@nestjs/common';

export const logger = new Logger();

export const Log = (
  message: string | ((...arg: any[]) => string),
  type: 'log' | 'error' = 'log',
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const value = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const msg = typeof message === 'string' ? message : message(...args);
      logger[type](msg, `${target.constructor.name}.${propertyKey}`);

      value(...args);
    };
  };
};
