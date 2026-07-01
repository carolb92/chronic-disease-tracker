export type MeasureStatus = "met" | "not-met" | "insufficient-data";

export type HedisMeasureResult = {
	name: string;
	status: MeasureStatus;
	detail: string;
};

// Finds the most recent observation matching a LOINC code within the measurement year
function getMostRecentInYear(
	observations: fhir4.Observation[],
	loincCode: string,
	measurementYear: number,
): fhir4.Observation | undefined {
	return observations
		.filter((obs) => {
			const matchesCode = obs.code?.coding?.some((c) => c.code === loincCode);
			const date = obs.effectiveDateTime
				? new Date(obs.effectiveDateTime)
				: null;
			const inYear = date?.getFullYear() === measurementYear;
			return matchesCode && inYear;
		})
		.sort(
			(a, b) =>
				new Date(b.effectiveDateTime ?? 0).getTime() -
				new Date(a.effectiveDateTime ?? 0).getTime(),
		)[0];
}

// Checks if any observation matching a LOINC code exists within the measurement year
function hasObservationInYear(
	observations: fhir4.Observation[],
	loincCode: string,
	measurementYear: number,
): boolean {
	return !!getMostRecentInYear(observations, loincCode, measurementYear);
}

// BP Control: most recent BP reading in measurement year must be <140/90
function evaluateBPControl(
	observations: fhir4.Observation[],
	measurementYear: number,
): HedisMeasureResult {
	const bpObs = getMostRecentInYear(observations, "55284-4", measurementYear);

	if (!bpObs?.component) {
		return {
			name: "Blood Pressure Control (<140/90)",
			status: "insufficient-data",
			detail: `No blood pressure reading found in ${measurementYear}`,
		};
	}

	const systolic = bpObs.component.find((c) =>
		c.code?.coding?.some((coding) => coding.code === "8480-6"),
	)?.valueQuantity?.value;

	const diastolic = bpObs.component.find((c) =>
		c.code?.coding?.some((coding) => coding.code === "8462-4"),
	)?.valueQuantity?.value;

	if (systolic == null || diastolic == null) {
		return {
			name: "Blood Pressure Control (<140/90)",
			status: "insufficient-data",
			detail: "Blood pressure reading missing systolic or diastolic value",
		};
	}

	const controlled = systolic < 140 && diastolic < 90;
	return {
		name: "Blood Pressure Control (<140/90)",
		status: controlled ? "met" : "not-met",
		detail: `Most recent reading: ${systolic.toFixed(0)}/${diastolic.toFixed(0)} mm[Hg]`,
	};
}

// HbA1c: most recent reading in measurement year; <8% = good control, >9% = poor control
function evaluateA1cControl(
	observations: fhir4.Observation[],
	measurementYear: number,
): HedisMeasureResult {
	const a1cObs = getMostRecentInYear(observations, "4548-4", measurementYear);

	if (!a1cObs?.valueQuantity?.value) {
		return {
			name: "HbA1c Control",
			status: "insufficient-data",
			detail: `No HbA1c reading found in ${measurementYear}`,
		};
	}

	const value = a1cObs.valueQuantity.value;
	let status: MeasureStatus;
	let detail: string;

	if (value < 8) {
		status = "met";
		detail = `Good control: ${value.toFixed(1)}% (<8%)`;
	} else if (value >= 8 && value <= 9) {
		status = "not-met";
		detail = `Borderline: ${value.toFixed(1)}% (≥8%, ≤9%)`;
	} else {
		status = "not-met";
		detail = `Poor control: ${value.toFixed(1)}% (>9%)`;
	}

	return { name: "HbA1c Control", status, detail };
}

// Kidney Health Evaluation: both eGFR and uACR must be performed in the measurement year
function evaluateKidneyEvaluation(
	observations: fhir4.Observation[],
	measurementYear: number,
): HedisMeasureResult {
	const hasEGFR = hasObservationInYear(
		observations,
		"33914-3",
		measurementYear,
	);
	const hasUACR = hasObservationInYear(
		observations,
		"14959-1",
		measurementYear,
	);

	if (hasEGFR && hasUACR) {
		return {
			name: "Kidney Health Evaluation (eGFR + uACR)",
			status: "met",
			detail: `Both eGFR and uACR performed in ${measurementYear}`,
		};
	}

	const missing = [!hasEGFR ? "eGFR" : null, !hasUACR ? "uACR" : null]
		.filter(Boolean)
		.join(" and ");

	return {
		name: "Kidney Health Evaluation (eGFR + uACR)",
		status: missing === "eGFR and uACR" ? "insufficient-data" : "not-met",
		detail: `Missing ${missing} in ${measurementYear}`,
	};
}

// Evaluates all observation-based HEDIS diabetes measures for a given measurement year
export function evaluateDiabetesHedisMeasures(
	observations: fhir4.Observation[],
	measurementYear: number,
): HedisMeasureResult[] {
	return [
		evaluateBPControl(observations, measurementYear),
		evaluateA1cControl(observations, measurementYear),
		evaluateKidneyEvaluation(observations, measurementYear),
		{
			name: "Eye Exam",
			status: "insufficient-data",
			detail: `Missing eye exam records in ${measurementYear}`,
		},
	];
}
