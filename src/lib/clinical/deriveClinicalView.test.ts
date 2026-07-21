import { describe, it, expect } from "vitest";
import { deriveClinicalView } from "./deriveClinicalView";
import { makeCondition, makeObservation, makePatient } from "@/test/fixtures";

describe("deriveClinicalView", () => {
	it("populates HEDIS measures for a diabetic patient", () => {
		const patient = makePatient({ birthDate: "1970-01-01" });
		const conditions = [makeCondition({ snomed: "46635009" })]; // T1DM
		const observations = [
			makeObservation({ loinc: "4548-4", value: 6.5, unit: "%", date: "2024-01-01" }),
		];

		const view = deriveClinicalView(patient, conditions, observations);

		expect(view.diabetesHedisMeasures).not.toBeNull();
		expect(view.relevantSNOMEDCodes).toEqual(["46635009"]);
		expect(view.groupedObservations["4548-4"]).toHaveLength(1);
	});

	it("leaves HEDIS measures null for a non-diabetic patient", () => {
		const patient = makePatient();
		const conditions = [makeCondition({ snomed: "38341003" })]; // essential HTN
		const observations = [
			makeObservation({ loinc: "8480-6", value: 120, date: "2024-01-01" }),
		];

		const view = deriveClinicalView(patient, conditions, observations);

		expect(view.diabetesHedisMeasures).toBeNull();
	});

	it("excludes observations unrelated to the patient's tracked conditions", () => {
		const patient = makePatient();
		const conditions = [makeCondition({ snomed: "38341003" })]; // HTN only
		const unrelatedLipidObs = makeObservation({
			loinc: "2089-1", // LDL, only relevant to HLD
			value: 90,
			date: "2024-01-01",
		});

		const view = deriveClinicalView(patient, conditions, [unrelatedLipidObs]);

		expect(view.groupedObservations["2089-1"]).toBeUndefined();
	});

	it("ignores untracked conditions entirely", () => {
		const patient = makePatient();
		const conditions = [makeCondition({ snomed: "99999999" })];

		const view = deriveClinicalView(patient, conditions, []);

		expect(view.relevantConditions).toEqual([]);
		expect(view.relevantSNOMEDCodes).toEqual([]);
	});
});
