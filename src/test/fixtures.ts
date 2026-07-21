const SNOMED_SYSTEM = "http://snomed.info/sct";
const LOINC_SYSTEM = "http://loinc.org";

export function makeCondition({
	snomed,
	status = "active",
}: {
	snomed: string;
	status?: "active" | "resolved" | "inactive";
}): fhir4.Condition {
	return {
		resourceType: "Condition",
		subject: { reference: "Patient/example" },
		clinicalStatus: { coding: [{ code: status }] },
		code: { coding: [{ system: SNOMED_SYSTEM, code: snomed }] },
	};
}

export function makeObservation({
	loinc,
	value,
	unit = "mg/dL",
	date,
}: {
	loinc: string;
	value: number;
	unit?: string;
	date: string;
}): fhir4.Observation {
	return {
		resourceType: "Observation",
		status: "final",
		code: { coding: [{ system: LOINC_SYSTEM, code: loinc }] },
		effectiveDateTime: date,
		valueQuantity: { value, unit },
	};
}

export function makeBPObservation({
	systolic,
	diastolic,
	date,
}: {
	systolic?: number;
	diastolic?: number;
	date: string;
}): fhir4.Observation {
	const component: fhir4.ObservationComponent[] = [];
	if (systolic !== undefined) {
		component.push({
			code: { coding: [{ code: "8480-6" }] },
			valueQuantity: { value: systolic, unit: "mm[Hg]" },
		});
	}
	if (diastolic !== undefined) {
		component.push({
			code: { coding: [{ code: "8462-4" }] },
			valueQuantity: { value: diastolic, unit: "mm[Hg]" },
		});
	}
	return {
		resourceType: "Observation",
		status: "final",
		code: { coding: [{ system: LOINC_SYSTEM, code: "55284-4" }] },
		effectiveDateTime: date,
		component,
	};
}

export function makePatient({
	family = "Doe",
	given = ["Jane"],
	use,
	birthDate,
	gender,
}: {
	family?: string;
	given?: string[];
	use?: "official" | "usual";
	birthDate?: string;
	gender?: fhir4.Patient["gender"];
} = {}): fhir4.Patient {
	return {
		resourceType: "Patient",
		name: [{ family, given, use }],
		birthDate,
		gender,
	};
}
