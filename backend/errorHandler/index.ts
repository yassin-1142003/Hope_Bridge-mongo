import { ZodError } from "zod";

export type AppErrorCode =
  | "ERR_UNAUTHORIZED"
  | "ERR_NOT_FOUND"
  | "ERR_DATA_ALREADY_EXIST"
  | "ERR_MISSING_PARAMETER"
  | "ERR_INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly httpCode: number;
  public readonly isTrusted: boolean = true;
  public readonly details?: unknown;

  constructor(code: AppErrorCode, message: string, details?: unknown, httpCode?: number) {
    super(message);
    this.code = code;
    this.details = details;
    this.httpCode = httpCode ?? mapCodeToStatus(code);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function mapCodeToStatus(code: AppErrorCode): number {
  switch (code) {
    case "ERR_UNAUTHORIZED":
      return 401;
    case "ERR_NOT_FOUND":
      return 404;
    case "ERR_DATA_ALREADY_EXIST":
      return 409;
    case "ERR_MISSING_PARAMETER":
      return 400;
    case "ERR_INTERNAL_SERVER_ERROR":
    default:
      return 500;
  }
}

export interface FormattedError {
  code: AppErrorCode | "ERR_VALIDATION_ERROR" | "ERR_INTERNAL_SERVER_ERROR";
  cause: string;
  created_at: Date;
  details?: unknown;
}

class BaseErrorHandler {
  public httpCode: number = 500;

  handle(_err: unknown): void {
    // no-op by default
  }

  getFormatedError(err: unknown): FormattedError {
    if (err instanceof AppError) {
      this.httpCode = err.httpCode;
      return {
        code: err.code,
        cause: err.message,
        created_at: new Date(),
        details: err.details,
      };
    }

    if (err instanceof ZodError) {
      this.httpCode = 400;
      return {
        code: "ERR_VALIDATION_ERROR",
        cause: "Validation failed",
        created_at: new Date(),
        details: err.flatten(),
      };
    }

    this.httpCode = 500;
    return {
      code: "ERR_INTERNAL_SERVER_ERROR",
      cause: "Unknown error",
      created_at: new Date(),
    };
  }
}

export class ErrorHandlerFactory {
  createHandler(_err: unknown): BaseErrorHandler {
    return new BaseErrorHandler();
  }
}
