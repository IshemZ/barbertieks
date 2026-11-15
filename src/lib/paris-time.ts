// Le « jour » du salon est le jour calendaire à Paris, quel que soit le fuseau du serveur.
const TIME_ZONE = "Europe/Paris";

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const offsetFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

/** Date à Paris au format AAAA-MM-JJ. */
export function parisDate(at: Date = new Date()): string {
  return dateFormat.format(at);
}

/** Décalage de Paris par rapport à UTC, en millisecondes, à l'instant donné. */
function parisOffsetMs(utcMs: number): number {
  const parts = Object.fromEntries(
    offsetFormat.formatToParts(new Date(utcMs)).map((p) => [p.type, Number(p.value)]),
  );
  const asIfUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asIfUtc - utcMs;
}

/** Instant UTC correspondant à minuit à Paris pour la date donnée. */
function parisMidnight(year: number, month: number, day: number): Date {
  const naive = Date.UTC(year, month - 1, day);
  // À Paris, les changements d'heure ont lieu à 2 h ou 3 h : minuit n'est jamais ambigu.
  return new Date(naive - parisOffsetMs(naive - parisOffsetMs(naive)));
}

function parse(date: string): [number, number, number] {
  const [y, m, d] = date.split("-").map(Number);
  return [y, m, d];
}

export type Range = { start: string; end: string };

/** Bornes UTC [start, end[ d'une journée de Paris (AAAA-MM-JJ). */
export function dayRange(date: string): Range {
  const [y, m, d] = parse(date);
  return {
    start: parisMidnight(y, m, d).toISOString(),
    end: parisMidnight(y, m, d + 1).toISOString(),
  };
}

/** Bornes UTC [start, end[ du mois de Paris contenant la date (AAAA-MM-JJ). */
export function monthRange(date: string): Range {
  const [y, m] = parse(date);
  return {
    start: parisMidnight(y, m, 1).toISOString(),
    end: parisMidnight(y, m + 1, 1).toISOString(),
  };
}

/** Date calendaire décalée de n jours (AAAA-MM-JJ). */
export function addDays(date: string, days: number): string {
  const [y, m, d] = parse(date);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Vrai pour une date existante au format AAAA-MM-JJ (ex. refuse le 30 février). */
export function isDateString(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return addDays(value, 0) === value;
}

const dayLabelFormat = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const monthLabelFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", month: "long", year: "numeric" });

function asUtcDate(date: string): Date {
  const [y, m, d] = parse(date);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Ex. « dimanche 15 novembre 2026 ». */
export function dayLabel(date: string): string {
  return dayLabelFormat.format(asUtcDate(date));
}

/** Ex. « novembre 2026 ». */
export function monthLabel(date: string): string {
  return monthLabelFormat.format(asUtcDate(date));
}
