import { describe, it, expect } from "vitest";
import {
	filterActiveConditions,
	filterRelevantConditions,
	extractSNOMEDCodes,
	hasAnyCode,
} from "./conditions";
import { makeCondition } from "@/test/fixtures";

describe("filterActiveConditions", () => {
	it("keeps only conditions with clinicalStatus active", () => {
		const active = makeCondition({ snomed: "46635009", status: "active" });
		const resolved = makeCondition({ snomed: "44054006", status: "resolved" });
		expect(filterActiveConditions([active, resolved])).toEqual([active]);
	});
});

describe("filterRelevantConditions", () => {
	const tracked = ["46635009"];

	it("keeps active conditions matching a tracked SNOMED code", () => {
		const match = makeCondition({ snomed: "46635009" });
		expect(filterRelevantConditions([match], tracked)).toEqual([match]);
	});

	it("excludes conditions with an untracked SNOMED code", () => {
		const untracked = makeCondition({ snomed: "99999999" });
		expect(filterRelevantConditions([untracked], tracked)).toEqual([]);
	});

	it("excludes a tracked condition that is not active", () => {
		const inactive = makeCondition({ snomed: "46635009", status: "resolved" });
		expect(filterRelevantConditions([inactive], tracked)).toEqual([]);
	});
});

describe("extractSNOMEDCodes", () => {
	it("extracts the SNOMED code from each condition", () => {
		const conditions = [
			makeCondition({ snomed: "46635009" }),
			makeCondition({ snomed: "38341003" }),
		];
		expect(extractSNOMEDCodes(conditions)).toEqual(["46635009", "38341003"]);
	});

	it("ignores codings from non-SNOMED systems", () => {
		const condition = makeCondition({ snomed: "46635009" });
		condition.code!.coding!.push({
			system: "http://hl7.org/fhir/sid/icd-10",
			code: "E11",
		});
		expect(extractSNOMEDCodes([condition])).toEqual(["46635009"]);
	});
});

describe("hasAnyCode", () => {
	it("returns false for an empty code list", () => {
		expect(hasAnyCode([], ["46635009"])).toBe(false);
	});

	it("returns false when there is no overlap", () => {
		expect(hasAnyCode(["38341003"], ["46635009", "44054006"])).toBe(false);
	});

	it("returns true when a code is present in the group", () => {
		expect(hasAnyCode(["46635009"], ["46635009", "44054006"])).toBe(true);
	});
});
