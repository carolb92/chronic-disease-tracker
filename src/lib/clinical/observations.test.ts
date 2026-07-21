import { describe, it, expect } from "vitest";
import {
	groupAndSortObservations,
	deriveRelevantLOINCCodes,
	filterRelevantObservations,
} from "./observations";
import { makeCondition, makeObservation, makeBPObservation } from "@/test/fixtures";

describe("groupAndSortObservations", () => {
	it("formats a quantity value with its unit", () => {
		const obs = makeObservation({ loinc: "4548-4", value: 6.5, unit: "%", date: "2024-01-01" });
		const groups = groupAndSortObservations([obs]);
		expect(groups["4548-4"][0].value).toBe("6.50 %");
	});

	it("uses '—' when valueQuantity is missing", () => {
		const obs = makeObservation({ loinc: "4548-4", value: 6.5, date: "2024-01-01" });
		delete obs.valueQuantity;
		const groups = groupAndSortObservations([obs]);
		expect(groups["4548-4"][0].value).toBe("—");
	});

	it("splits a blood pressure observation into systolic/diastolic", () => {
		const obs = makeBPObservation({ systolic: 128, diastolic: 82, date: "2024-01-01" });
		const groups = groupAndSortObservations([obs]);
		const transformed = groups["55284-4"][0];
		expect(transformed.systolic).toBe(128);
		expect(transformed.diastolic).toBe(82);
		expect(transformed.value).toBe("128/82 mm[Hg]");
	});

	it("uses '—' for a missing BP component", () => {
		const obs = makeBPObservation({ systolic: 128, date: "2024-01-01" });
		const groups = groupAndSortObservations([obs]);
		expect(groups["55284-4"][0].value).toBe("128/— mm[Hg]");
	});

	it("groups observations by LOINC code", () => {
		const a1c = makeObservation({ loinc: "4548-4", value: 6.5, date: "2024-01-01" });
		const glucose = makeObservation({ loinc: "2345-7", value: 100, date: "2024-01-01" });
		const groups = groupAndSortObservations([a1c, glucose]);
		expect(Object.keys(groups).sort()).toEqual(["2345-7", "4548-4"]);
	});

	it("sorts each group by date, most recent first", () => {
		const older = makeObservation({ loinc: "4548-4", value: 6.5, date: "2023-01-01" });
		const newer = makeObservation({ loinc: "4548-4", value: 7.0, date: "2024-01-01" });
		const groups = groupAndSortObservations([older, newer]);
		expect(groups["4548-4"].map((o) => o.isoDate)).toEqual([
			"2024-01-01",
			"2023-01-01",
		]);
	});
});

describe("deriveRelevantLOINCCodes", () => {
	it("collects LOINC codes across multiple conditions and dedupes them", () => {
		const conditions = [
			makeCondition({ snomed: "46635009" }),
			makeCondition({ snomed: "44054006" }),
		];
		const map = {
			"46635009": ["4548-4", "2345-7"],
			"44054006": ["4548-4"],
		};
		const codes = deriveRelevantLOINCCodes(conditions, map);
		expect([...codes].sort()).toEqual(["2345-7", "4548-4"]);
	});
});

describe("filterRelevantObservations", () => {
	it("keeps only LOINC-coded observations whose code is relevant", () => {
		const relevant = makeObservation({ loinc: "4548-4", value: 6.5, date: "2024-01-01" });
		const irrelevant = makeObservation({ loinc: "9999-9", value: 1, date: "2024-01-01" });
		const result = filterRelevantObservations(
			[relevant, irrelevant],
			new Set(["4548-4"]),
		);
		expect(result).toEqual([relevant]);
	});

	it("excludes observations from a non-LOINC coding system", () => {
		const obs = makeObservation({ loinc: "4548-4", value: 6.5, date: "2024-01-01" });
		obs.code!.coding![0].system = "http://example.org/local-codes";
		const result = filterRelevantObservations([obs], new Set(["4548-4"]));
		expect(result).toEqual([]);
	});
});
