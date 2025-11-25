interface APIError {
  code: string;
  cause: string;
  created_at: Date;
  details?: unknown;
}

interface APIResponseShape<T = unknown> {
  message: string;
  success: boolean;
  details?: T;
  error?: APIError;
  sentAt: Date;
}

export class APIResBuilder<T = unknown> {
  private _message = "";
  private _success = false;
  private _details?: T;
  private _error?: APIError;

  setMessage(message: string): this {
    this._message = message;
    return this;
  }

  setSuccess(success: boolean): this {
    this._success = success;
    return this;
  }

  setDetails(details: T): this {
    this._details = details;
    return this;
  }

  setError(error: APIError): this {
    this._error = error;
    return this;
  }

  build(): APIResponseShape<T> {
    return {
      message: this._message,
      success: this._success,
      details: this._details,
      error: this._error,
      sentAt: new Date(),
    };
  }
}
