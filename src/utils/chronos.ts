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

export const FORM_ORIGIN: number = 0;
export const FORM_IN_PROGRESS: number = 1;
export const FORM_COMPLETE: number = 2;


