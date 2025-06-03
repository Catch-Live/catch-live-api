import { HttpStatus } from '@nestjs/common';

export const HttpStatusMessage: Record<number, string> = {};

for (const key in HttpStatus) {
  const value = HttpStatus[key as keyof typeof HttpStatus];

  if (typeof value === 'number') {
    HttpStatusMessage[value] = key;
  }
}
