import { ErrorHandlerFactory } from '@/backend/errorHandler';
import { APIResBuilder } from '@/backend/resManager';
import { NextResponse } from 'next/server';

function withErrorHandler<T extends (...args: any[]) => Promise<any>>(handler: T) {
  return async (...args: Parameters<T>): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err: any) {
      return handleError(err);
    }
  };
}

function handleError(err: any) {
  // get a response builder
  const resBuilder = new APIResBuilder();
  // handle unknown errors
  if (!err.isTrusted) {
    console.log("Unknown error occured", err)
    return NextResponse.json(
      resBuilder
        .setMessage("Your request resulted in an error, please check the error property below")
        .setError({
          code: "ERR_INTERNAL_SERVER_ERROR",
          cause: "Unknown",
          created_at: new Date()
        })
        .build()
      , {
        status: 500
      })
  }

  // handle known errors
  const handler = new ErrorHandlerFactory().createHandler(err)
  handler.handle(err)

  console.log(handler.getFormatedError(err))

  return NextResponse.json(resBuilder
    .setMessage("Your request resulted in an error, please check the error property below")
    .setError(handler.getFormatedError(err))
    .build(), {
    status: handler.httpCode
  });
}

export { withErrorHandler, handleError }
