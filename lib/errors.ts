export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = this.getStatusCodeFromCode(code);
    this.details = details;
  }

  private getStatusCodeFromCode(code: string): number {
    switch (code) {
      case 'ERR_UNAUTHORIZED':
        return 401;
      case 'ERR_FORBIDDEN':
        return 403;
      case 'ERR_NOT_FOUND':
        return 404;
      case 'ERR_MISSING_PARAMETER':
        return 400;
      case 'ERR_VALIDATION':
        return 400;
      case 'ERR_INTERNAL':
      default:
        return 500;
    }
  }
}
