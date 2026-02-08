import { parseISO, isValid } from 'date-fns';

export function getTimeStamp(): string {
    let now: Date = new Date(); 
  return now.toISOString();
}

export function getExtantDate(): string {
    let now: Date = new Date(); 
    let isoDateOnly = now.toISOString().split('T')[0];
    return isoDateOnly;
}

export function getExtantFullDate(): string {
    return "";
}

export const ensureDate = (date: Date | string | undefined): Date | undefined => {
  if (!date) return undefined;
  if (date instanceof Date) return date; 

  const parsed = parseISO(date); // or new Date(date)
  return isValid(parsed) ? parsed : undefined;
};

export const FORM_ORIGIN: number = 0;
export const FORM_IN_PROGRESS: number = 1;
export const FORM_COMPLETE: number = 2;


