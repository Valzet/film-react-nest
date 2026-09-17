import { ValueTransformer } from 'typeorm';

export const commaSeparatedTransformer: ValueTransformer = {
  to(value: string[] | string | null | undefined): string {
    if (Array.isArray(value)) {
      return value.join(',');
    }

    return value ?? '';
  },
  from(value: string | string[] | null | undefined): string[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value) {
      return [];
    }

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  },
};
