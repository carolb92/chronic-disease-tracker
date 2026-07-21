import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { deriveDisplayDemographics } from "./demographics";
import { makePatient } from "@/test/fixtures";

describe("deriveDisplayDemographics", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 6, 21));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns all nulls for a null patient", () => {
		expect(deriveDisplayDemographics(null)).toEqual({
			displayName: null,
			displayBDay: null,
			age: null,
			gender: null,
		});
	});

	it("prefers the official name over usual or first", () => {
		const patient = makePatient();
		patient.name = [
			{ family: "First", given: ["A"] },
			{ family: "Usual", given: ["B"], use: "usual" },
			{ family: "Official", given: ["C"], use: "official" },
		];
		expect(deriveDisplayDemographics(patient).displayName).toBe("Official, C");
	});

	it("falls back to usual name when no official name exists", () => {
		const patient = makePatient();
		patient.name = [
			{ family: "First", given: ["A"] },
			{ family: "Usual", given: ["B"], use: "usual" },
		];
		expect(deriveDisplayDemographics(patient).displayName).toBe("Usual, B");
	});

	it("falls back to the first name entry when no use is set", () => {
		const patient = makePatient();
		patient.name = [{ family: "First", given: ["A"] }];
		expect(deriveDisplayDemographics(patient).displayName).toBe("First, A");
	});

	it("returns a null displayName when the patient has no name array", () => {
		const patient = makePatient();
		delete patient.name;
		expect(deriveDisplayDemographics(patient).displayName).toBeNull();
	});

	it("derives displayBDay and age from birthDate", () => {
		const patient = makePatient({ birthDate: "1996-07-21" });
		const result = deriveDisplayDemographics(patient);
		expect(result.displayBDay).toBe("07/21/1996");
		expect(result.age).toBe(30);
	});

	it("passes through gender", () => {
		const patient = makePatient({ gender: "female" });
		expect(deriveDisplayDemographics(patient).gender).toBe("female");
	});
});
