import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatDate, calculateAge, parseLocalDate } from "./utils";

describe("parseLocalDate", () => {
	it("preserves the year, month, and day regardless of the runtime timezone", () => {
		// Built from local Y/M/D components, so these getters (which also read
		// local time) can never disagree with the input — no UTC round-trip
		// in between for a timezone offset to corrupt.
		const date = parseLocalDate("1996-07-21");
		expect(date.getFullYear()).toBe(1996);
		expect(date.getMonth()).toBe(6);
		expect(date.getDate()).toBe(21);
	});
});

describe("formatDate", () => {
	it("formats a date-only string as MM/DD/YYYY without shifting days", () => {
		expect(formatDate("2020-03-05")).toBe("03/05/2020");
	});

	it("still formats a full ISO datetime correctly", () => {
		expect(formatDate("2024-01-01T08:00:00-05:00")).toBe("01/01/2024");
	});
});

describe("calculateAge", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 6, 21)); // "today" = 2026-07-21
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns the correct age when the birthday already passed this year", () => {
		expect(calculateAge(new Date(1996, 0, 1))).toBe(30); // Jan 1
	});

	it("returns age - 1 when the birthday has not yet occurred this year", () => {
		expect(calculateAge(new Date(1996, 11, 31))).toBe(29); // Dec 31
	});

	it("returns the correct age when today is the birthday", () => {
		expect(calculateAge(new Date(1996, 6, 21))).toBe(30);
	});

	it("returns age - 1 the day before the birthday, same month", () => {
		expect(calculateAge(new Date(1996, 6, 22))).toBe(29);
	});

	it("handles a Feb 29 birthday", () => {
		expect(calculateAge(new Date(2000, 1, 29))).toBe(26);
	});
});
