import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status: number;
    let message: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal server error";
    }

    const payload = {
      success: false,
      message:
        typeof message === "string"
          ? message
          : (message as any).message ?? "Request failed",
      error: {
        statusCode: status,
        ...(typeof message === "object" ? message : {}),
      },
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(payload);
  }
}
