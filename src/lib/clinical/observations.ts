import { formatDate } from "@/lib/utils";

export type TransformedObservation = {
	code: string;
	display: string;
	value: string;
	date: string;
	isoDate: string;
	numericValue?: number;
	unit?: string;
	systolic?: number;
	diastolic?: number;
};

// Formats a FHIR Quantity as "value unit" (e.g. "6.07 %")
function formatValue(qty: fhir4.Quantity): string {
	return `${qty.value?.toFixed(2)} ${qty.unit ?? ""}`.trim();
}

// Extracts display-ready fields from a FHIR Observation; handles BP component observations separately
function transformObservation(obs: fhir4.Observation): TransformedObservation {
	const coding = obs.code?.coding?.[0];
	const code = coding?.code ?? "";
	const display = coding?.display ?? "";
	const isoDate = obs.effectiveDateTime ?? "";
	const date = isoDate ? formatDate(isoDate) : "";

	if (obs.component) {
		const systolicComp = obs.component.find((c) =>
			c.code?.coding?.some((coding) => coding.code === "8480-6"),
		);
		const diastolicComp = obs.component.find((c) =>
			c.code?.coding?.some((coding) => coding.code === "8462-4"),
		);
		const sNum = systolicComp?.valueQuantity?.value;
		const dNum = diastolicComp?.valueQuantity?.value;
		const sVal = sNum?.toFixed(0) ?? "—";
		const dVal = dNum?.toFixed(0) ?? "—";
		const unit = systolicComp?.valueQuantity?.unit ?? "mm[Hg]";
		return {
			code, display,
			value: `${sVal}/${dVal} ${unit}`,
			date, isoDate,
			systolic: sNum,
			diastolic: dNum,
		};
	}

	const value = obs.valueQuantity ? formatValue(obs.valueQuantity) : "—";
	return { code, display, value, date, isoDate, numericValue: obs.valueQuantity?.value, unit: obs.valueQuantity?.unit };
}

// Groups observations by LOINC code and sorts each group by date, most recent first
export function groupAndSortObservations(
	observations: fhir4.Observation[],
): Record<string, TransformedObservation[]> {
	const groups: Record<string, TransformedObservation[]> = {};

	for (const obs of observations) {
		const transformed = transformObservation(obs);
		if (!groups[transformed.code]) {
			groups[transformed.code] = [];
		}
		groups[transformed.code].push(transformed);
	}

	for (const code in groups) {
		groups[code].sort(
			(a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime(),
		);
	}

	return groups;
}

// Builds the set of LOINC codes relevant to a patient's tracked conditions
export function deriveRelevantLOINCCodes(
	conditions: fhir4.Condition[],
	snomedToLoinc: Record<string, string[]>,
): Set<string> {
	const loincCodes = new Set<string>();
	conditions.forEach((condition) => {
		condition.code?.coding?.forEach((coding) => {
			if (coding.code && coding.code in snomedToLoinc) {
				for (const loinc of snomedToLoinc[coding.code]) {
					loincCodes.add(loinc);
				}
			}
		});
	});
	return loincCodes;
}

// Filters observations to those whose LOINC code is in the relevant set
export function filterRelevantObservations(
	observations: fhir4.Observation[],
	relevantLOINCCodes: Set<string>,
): fhir4.Observation[] {
	return observations.filter((obs) =>
		obs.code?.coding?.some(
			(coding) =>
				coding.system === "http://loinc.org" &&
				coding.code &&
				relevantLOINCCodes.has(coding.code),
		),
	);
}
