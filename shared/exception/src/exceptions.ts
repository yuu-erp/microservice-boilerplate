import {
  ARGUMENT_INVALID,
  ARGUMENT_NOT_PROVIDED,
  ARGUMENT_OUT_OF_RANGE,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "./exception.codes";
import { DomainException } from "./exception.domain";

/**
 * Used to indicate that an argument was not provided (is empty object/array, null of undefined).
 *
 * @class ArgumentNotProvidedException
 * @extends {DomainException}
 */
export class ArgumentNotProvidedException extends DomainException {
  readonly code = ARGUMENT_NOT_PROVIDED;
}

/**
 * Used to indicate that an incorrect argument was provided to a method/function/class constructor
 *
 * @class ArgumentInvalidException
 * @extends {DomainException}
 */
export class ArgumentInvalidException extends DomainException {
  readonly code = ARGUMENT_INVALID;
}

/**
 * Used to indicate that an argument is out of allowed range
 * (for example: incorrect string/array length, number not in allowed min/max range etc)
 *
 * @class ArgumentOutOfRangeException
 * @extends {DomainException}
 */
export class ArgumentOutOfRangeException extends DomainException {
  readonly code = ARGUMENT_OUT_OF_RANGE;
}

/**
 * Used to indicate conflicting entities (usually in the database)
 *
 * @class ConflictException
 * @extends {DomainException}
 */
export class ConflictException extends DomainException {
  readonly code = CONFLICT;
}

/**
 * Used to indicate that entity is not found
 *
 * @class NotFoundException
 * @extends {DomainException}
 */
export class NotFoundException extends DomainException {
  static readonly message = "Not found";

  readonly code = NOT_FOUND;
}

/**
 * Used to indicate an internal server error that does not fall under all other errors
 *
 * @class InternalServerErrorException
 * @extends {DomainException}
 */
export class InternalServerErrorException extends DomainException {
  message = "Internal server error";

  readonly code = INTERNAL_SERVER_ERROR;
}
