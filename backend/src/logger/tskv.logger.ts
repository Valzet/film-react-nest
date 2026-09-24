import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private stringify(value: unknown): string {
    if (value === null || value === undefined) {
      return String(value);
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private escape(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/=/g, '\\=');
  }

  formatMessage(level: string, message: unknown, ...optionalParams: unknown[]) {
    const parts = [
      `level=${this.escape(this.stringify(level))}`,
      `message=${this.escape(this.stringify(message))}`,
    ];

    if (optionalParams.length > 0) {
      parts.push(
        `optionalParams=${this.escape(this.stringify(optionalParams))}`,
      );
    }

    return `${parts.join('\t')}\n`;
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    process.stdout.write(this.formatMessage('log', message, ...optionalParams));
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    process.stderr.write(
      this.formatMessage('error', message, ...optionalParams),
    );
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    process.stderr.write(
      this.formatMessage('warn', message, ...optionalParams),
    );
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    process.stdout.write(
      this.formatMessage('debug', message, ...optionalParams),
    );
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    process.stdout.write(
      this.formatMessage('verbose', message, ...optionalParams),
    );
  }
}
