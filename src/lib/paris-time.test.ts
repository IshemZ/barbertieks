import { describe, expect, it } from "vitest";
import { addDays, dayLabel, dayRange, isDateString, monthLabel, monthRange, parisDate } from "./paris-time";

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

describe("addDays", () => {
  it("passe au jour suivant en changeant de mois", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
  });

  it("recule d'un jour en changeant d'année", () => {
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("isDateString", () => {
  it("accepte une date réelle au format AAAA-MM-JJ", () => {
    expect(isDateString("2026-02-28")).toBe(true);
  });

  it("refuse une date impossible ou mal formée", () => {
    for (const value of ["2026-02-30", "2026-13-01", "15/11/2026", "", undefined, ["2026-11-15"]]) {
      expect(isDateString(value)).toBe(false);
    }
  });
});

describe("libellés", () => {
  it("affiche le jour en toutes lettres", () => {
    expect(dayLabel("2026-11-15")).toBe("dimanche 15 novembre 2026");
  });

  it("affiche le mois en toutes lettres", () => {
    expect(monthLabel("2026-11-15")).toBe("novembre 2026");
  });
});
