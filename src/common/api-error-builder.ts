import { Logger } from '@nestjs/common';
import { ApiErrorResponse } from './api-error';
import { ErrorCode } from './error-codes';

export class ApiErrorResponseBuilder {
  private errorResponse: ApiErrorResponse;
  private logger?: Logger;

  constructor(errorCode: ErrorCode, errorMessage?: string) {
    this.errorResponse = {
      errorCode,
      errorMessage,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Set a logger instance to log the error response
   * @param logger Logger instance
   * @returns ApiErrorResponseBuilder instance
   */
  withLogger(logger: Logger): ApiErrorResponseBuilder {
    this.logger = logger;
    return this;
  }

  /**
   * Add additional data to the error response
   * @param data Additional data to include in the error response
   * @returns ApiErrorResponseBuilder instance
   */
  withData(data: Record<string, any>): ApiErrorResponseBuilder {
    this.errorResponse = {
      ...this.errorResponse,
      ...data,
    };
    return this;
  }

  /**
   * Build the error response and optionally log it
   * @returns ApiErrorResponse instance
   */
  build(): ApiErrorResponse {
    if (this.logger) {
      this.logger.log(JSON.stringify(this.errorResponse));
    }
    return this.errorResponse;
  }

  /**
   * Create a new builder instance with the given error code and message
   * @param errorCode Error code from the ErrorCode enum
   * @param errorMessage Human-readable error message
   * @returns New ApiErrorResponseBuilder instance
   */
  static create(errorCode: ErrorCode, errorMessage?: string): ApiErrorResponseBuilder {
    return new ApiErrorResponseBuilder(errorCode, errorMessage);
  }
} 