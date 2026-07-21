import { describe, it, expect } from "vitest";
import { evaluateDiabetesCareGuidelines, A1C_GOAL } from "./diabetesCareGuidelines";
import { makeObservation, makeBPObservation } from "@/test/fixtures";

function findMeasure(
	results: ReturnType<typeof evaluateDiabetesCareGuidelines>,
	name: string,
) {
	return results.find((r) => r.name.startsWith(name));
}

describe("BP control", () => {
	it("is met when the most recent reading is below goal", () => {
		const obs = [makeBPObservation({ systolic: 120, diastolic: 75, date: "2024-01-01" })];
		const result = findMeasure(evaluateDiabetesCareGuidelines(obs), "Blood Pressure Control");
		expect(result?.status).toBe("met");
	});

	it("is not met when the most recent reading is at or above goal", () => {
		const obs = [makeBPObservation({ systolic: 135, diastolic: 85, date: "2024-01-01" })];
		const result = findMeasure(evaluateDiabetesCareGuidelines(obs), "Blood Pressure Control");
		expect(result?.status).toBe("not-met");
	});

	it("uses the most recent reading when multiple exist", () => {
		const older = makeBPObservation({ systolic: 135, diastolic: 85, date: "2023-01-01" });
		const newer = makeBPObservation({ systolic: 120, diastolic: 75, date: "2024-01-01" });
		const result = findMeasure(
			evaluateDiabetesCareGuidelines([older, newer]),
			"Blood Pressure Control",
		);
		expect(result?.status).toBe("met");
	});

	it("is insufficient-data when no BP reading exists", () => {
		const result = findMeasure(evaluateDiabetesCareGuidelines([]), "Blood Pressure Control");
		expect(result?.status).toBe("insufficient-data");
	});

	it("is insufficient-data when a component is missing", () => {
		const obs = [makeBPObservation({ systolic: 120, date: "2024-01-01" })];
		const result = findMeasure(evaluateDiabetesCareGuidelines(obs), "Blood Pressure Control");
		expect(result?.status).toBe("insufficient-data");
	});
});

describe("A1c control", () => {
	it("is met when below goal", () => {
		const obs = [makeObservation({ loinc: "4548-4", value: A1C_GOAL - 0.5, date: "2024-01-01" })];
		const result = findMeasure(evaluateDiabetesCareGuidelines(obs), "HbA1c Control");
		expect(result?.status).toBe("met");
	});

	it("is not met when at or above goal", () => {
		const obs = [makeObservation({ loinc: "4548-4", value: A1C_GOAL + 0.5, date: "2024-01-01" })];
		const result = findMeasure(evaluateDiabetesCareGuidelines(obs), "HbA1c Control");
		expect(result?.status).toBe("not-met");
	});

	it("is insufficient-data when no reading exists", () => {
		const result = findMeasure(evaluateDiabetesCareGuidelines([]), "HbA1c Control");
		expect(result?.status).toBe("insufficient-data");
	});
});

describe("Kidney health evaluation", () => {
	it("is met when eGFR and uACR were both performed in the same year", () => {
		const obs = [
			makeObservation({ loinc: "33914-3", value: 90, date: "2024-03-01" }),
			makeObservation({ loinc: "14959-1", value: 20, date: "2024-06-01" }),
		];
		const result = findMeasure(evaluateDiabetesCareGuidelines(obs), "Kidney Health Evaluation");
		expect(result?.status).toBe("met");
	});

	it("is not met when eGFR and uACR were performed in different years", () => {
		const obs = [
			makeObservation({ loinc: "33914-3", value: 90, date: "2023-03-01" }),
			makeObservation({ loinc: "14959-1", value: 20, date: "2024-06-01" }),
		];
		const result = findMeasure(evaluateDiabetesCareGuidelines(obs), "Kidney Health Evaluation");
		expect(result?.status).toBe("not-met");
	});

	it("is insufficient-data when both eGFR and uACR are missing", () => {
		const result = findMeasure(evaluateDiabetesCareGuidelines([]), "Kidney Health Evaluation");
		expect(result?.status).toBe("insufficient-data");
	});

	it("is not-met (with detail) when only one of eGFR/uACR is missing", () => {
		const obs = [makeObservation({ loinc: "33914-3", value: 90, date: "2024-03-01" })];
		const result = findMeasure(evaluateDiabetesCareGuidelines(obs), "Kidney Health Evaluation");
		expect(result?.status).toBe("not-met");
		expect(result?.detail).toContain("uACR");
	});
});

describe("evaluateDiabetesCareGuidelines", () => {
	it("returns all four diabetes measures", () => {
		const results = evaluateDiabetesCareGuidelines([]);
		expect(results.map((r) => r.name)).toEqual([
			expect.stringContaining("Blood Pressure Control"),
			"HbA1c Control",
			expect.stringContaining("Kidney Health Evaluation"),
			"Eye Exam",
		]);
	});
});
