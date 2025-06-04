import { RequestErrorCode } from 'src/interfaces/common/errors/request-error-code';

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
};
