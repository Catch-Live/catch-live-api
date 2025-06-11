import { RequestErrorCode } from '../errors/request-error-code';

export const FieldConstraintErrorMap: Partial<
  Record<string, Partial<Record<string, RequestErrorCode>>>
> = {
  order: {
    isIn: RequestErrorCode.INVALID_SORT,
    isInt: RequestErrorCode.INVALID_SORT,
    isNumber: RequestErrorCode.INVALID_QUERY_STRING,
  },
  q: {
    isString: RequestErrorCode.INVALID_QUERY_STRING,
  },
  filter: {
    isIn: RequestErrorCode.INVALID_RECORDING_STATUS,
  },
  size: {
    isInt: RequestErrorCode.INVALID_QUERY_STRING,
    min: RequestErrorCode.INVALID_MIN_SIZE,
  },
  sortBy: {
    isIn: RequestErrorCode.INVALID_SORT_BY,
  },
  provider: {
    isIn: RequestErrorCode.INVALID_PROVIDER,
    isString: RequestErrorCode.INVALID_PROVIDER,
  },
  authorizationCode: {
    isString: RequestErrorCode.INVALID_QUERY_STRING,
  },
  state: {
    isString: RequestErrorCode.INVALID_QUERY_STRING,
  },
  email: {
    isString: RequestErrorCode.INVALID_QUERY_STRING,
  },
  nickname: {
    isString: RequestErrorCode.INVALID_QUERY_STRING,
    isLength: RequestErrorCode.INVALID_NICKNAME_LENGTH,
  },
};
