import { BaseException } from './exception.base';

export class DomainException extends BaseException {
  constructor(message: string, errorCode = 'DOMAIN_ERROR') {
    super(message, 400, errorCode);
  }
}
