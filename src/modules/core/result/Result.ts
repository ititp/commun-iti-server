export interface Ok {
    success: true;
    hasValue: false;
}

export interface OkVal<TValue> {
    success: true;
    hasValue: true;
    value: TValue;
}

export type ReasonType = string | number;

export interface Bad<TReason extends ReasonType = ReasonType> {
    success: false;
    hasValue: false;
    reason: TReason;
}

export interface BadVal<TReason extends ReasonType, TValue> {
    success: false;
    hasValue: true;
    reason: TReason;
    value: TValue;
}

export type OkResult = Ok | OkVal<any>;
export type BadResult = Bad | BadVal<ReasonType, any>;
export type AnyResult = OkResult | BadResult;

export class ResultWrapper {
    readonly success: boolean = false;

    readonly hasValue: boolean = false;
    readonly value?: any;

    readonly reason?: ReasonType;

    constructor(from?: Partial<ResultWrapper>) {
        if (from != undefined) {
            this.success = from.success ?? false;
            this.hasValue = from.hasValue ?? from.value !== undefined;
            this.value = from.value;
            this.reason = from.reason;
        }
    }
}

/**
 * Returns an empty successful result.
 */
function ok(value?: undefined): Ok;

/**
 * Returns a successful result with a typed string or number value.
 * @param value A typed string or number.
 */
function ok<T extends string | number>(value: T): OkVal<T>;

/**
 * Returns a successful result with a typed value.
 * @param value The value to return.
 */
function ok<T>(value: T): OkVal<T>;

function ok<T>(value?: any): Ok | OkVal<T> {
    if (value !== undefined) return new ResultWrapper({ success: true, hasValue: true, value }) as OkVal<T>;
    else return new ResultWrapper({ success: true }) as Ok;
}

/**
 * Common shortcuts for ok results.
 */
namespace ok {}

/**
 * Returns a failed result with a typed string or number reason.
 * @param reason A typed string or number reason describing why the operation has failed.
 */
function bad<TReason extends ReasonType>(reason: TReason, value?: undefined): Bad<TReason>;

function bad<TReason extends ReasonType, TValue>(reason: TReason, value: TValue): BadVal<TReason, TValue>;

function bad<TReason extends ReasonType, TValue>(reason: TReason, value?: TValue): Bad<TReason> | BadVal<TReason, TValue> {
    if (value !== undefined) return new ResultWrapper({ success: false, reason, value, hasValue: true }) as BadVal<TReason, TValue>;
    else return new ResultWrapper({ success: false, reason }) as Bad<TReason>;
}

type BadFactoryFunc<TReason extends ReasonType> =
    & ((value?: undefined) => Bad<TReason>)
    & (<TValue>(value: TValue) => BadVal<TReason, TValue>);

export function BadFactory<TReason extends ReasonType>(reason: TReason): BadFactoryFunc<TReason> {
    function factory(value?: undefined): Bad<TReason>;
    function factory<TValue>(value: TValue): BadVal<TReason, TValue>;
    function factory<TValue>(value?: TValue) {
        return bad(reason, value) as Bad<TReason> | BadVal<TReason, TValue>;
    }

    return factory;
}

/**
 * Common shortcuts for bad results.
 */
namespace bad {
    /**
     * The current actor does not have sufficient rights to perform this operation.
     */
    export const forbidden = BadFactory("FORBIDDEN");

    /**
     * The current actor is not authenticated, or its authentication cannot be verified.
     */
    export const notAuthorized = BadFactory("NOT_AUTHORIZED");

    /**
     * The requested entity was not found
     */
    export const notFound = BadFactory("NOT_FOUND");

    /**
     * Validation of the input parameters has failed.
     */
    export const validationFailed = BadFactory("VALIDATION_FAILED");
}

/**
 * A "Bad" result represents an operation that has failed, whose origin is known or which was predictable.
 * The result contains a reason describing why the operation has failed.
 * Note: any exceptional errors that cannot be compensated should not be represented as a result, but thrown as an exception (e.g.: a database transaction has failed, a request failed due to a network error, etc).
 */
export const Bad = bad;

/**
 * An "Ok" result represents an operation that has been successfully completed.
 * The result may include a value.
 */
export const Ok = ok;
