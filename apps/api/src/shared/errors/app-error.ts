export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational = true;

  constructor(message: string, statusCode = 400, code = "APP_ERROR") {
    super(message);

    this.code = code;
    this.statusCode = statusCode;
  }
}
