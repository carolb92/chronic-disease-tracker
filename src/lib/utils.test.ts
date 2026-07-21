import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { formatDate, calculateAge } from "./utils";

describe("formatDate", () => {
	it("formats an ISO date string as MM/DD/YYYY", () => {
		expect(formatDate("2020-03-05")).toBe("03/05/2020");
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
