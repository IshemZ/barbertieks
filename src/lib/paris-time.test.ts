import { describe, expect, it } from "vitest";
import { dayRange, monthRange, parisDate } from "./paris-time";

describe("parisDate", () => {
  it("donne la date à Paris, pas en UTC", () => {
    // 23h30 UTC le 14/11 = 00h30 le 15/11 à Paris (UTC+1 en hiver).
    expect(parisDate(new Date("2026-11-14T23:30:00Z"))).toBe("2026-11-15");
  });
});

describe("dayRange", () => {
  it("couvre la journée de Paris en heure d'hiver", () => {
    expect(dayRange("2026-11-15")).toEqual({
      start: "2026-11-14T23:00:00.000Z",
      end: "2026-11-15T23:00:00.000Z",
    });
  });

  it("couvre la journée de Paris en heure d'été", () => {
    expect(dayRange("2026-07-01")).toEqual({
      start: "2026-06-30T22:00:00.000Z",
      end: "2026-07-01T22:00:00.000Z",
    });
  });

  it("gère le jour du passage à l'heure d'hiver (25 h)", () => {
    expect(dayRange("2026-10-25")).toEqual({
      start: "2026-10-24T22:00:00.000Z",
      end: "2026-10-25T23:00:00.000Z",
    });
  });
});

describe("monthRange", () => {
  it("couvre le mois de Paris", () => {
    expect(monthRange("2026-11-15")).toEqual({
      start: "2026-10-31T23:00:00.000Z",
      end: "2026-11-30T23:00:00.000Z",
    });
  });

  it("passe à l'année suivante en décembre", () => {
    expect(monthRange("2026-12-03")).toEqual({
      start: "2026-11-30T23:00:00.000Z",
      end: "2026-12-31T23:00:00.000Z",
    });
  });
});
