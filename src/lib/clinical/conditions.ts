// Conditions whose clinicalStatus is coded as "active"
export function filterActiveConditions(
	conditions: fhir4.Condition[],
): fhir4.Condition[] {
	return conditions.filter((c) =>
		c.clinicalStatus?.coding?.find((item) => item.code === "active"),
	);
}

// Active conditions matching one of the tracked SNOMED codes
export function filterRelevantConditions(
	conditions: fhir4.Condition[],
	trackedConditionCodes: string[],
): fhir4.Condition[] {
	const trackedConditionSet = new Set(trackedConditionCodes);
	const activeConditions = filterActiveConditions(conditions);

	return activeConditions.filter((entry) =>
		entry.code?.coding?.some(
			(item) =>
				item.system === "http://snomed.info/sct" &&
				item.code &&
				trackedConditionSet.has(item.code),
		),
	);
}

// All SNOMED codes present on a set of conditions
export function extractSNOMEDCodes(conditions: fhir4.Condition[]): string[] {
	return conditions
		.flatMap((entry) =>
			entry.code?.coding?.map((item) => {
				if (item.system === "http://snomed.info/sct") return item.code;
			}),
		)
		.filter((item) => item !== undefined);
}

// Whether any of a patient's SNOMED codes fall in a given disease-group code list
export function hasAnyCode(snomedCodes: string[], group: string[]): boolean {
	return snomedCodes.some((code) => group.includes(code));
}
