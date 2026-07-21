export type MeasureStatus = "met" | "not-met" | "insufficient-data";

export type DiabetesCareGuidelineResult = {
	name: string;
	status: MeasureStatus;
	detail: string;
};

// Finds the most recent observation matching a LOINC code, regardless of year
function getMostRecentObservation(
	observations: fhir4.Observation[],
	loincCode: string,
): fhir4.Observation | undefined {
	return observations
		.filter((obs) => obs.code?.coding?.some((c) => c.code === loincCode))
		.sort(
			(a, b) =>
				new Date(b.effectiveDateTime ?? 0).getTime() -
				new Date(a.effectiveDateTime ?? 0).getTime(),
		)[0];
}

// All distinct years in which an observation matching a LOINC code was recorded
function getYearsForCode(
	observations: fhir4.Observation[],
	loincCode: string,
): Set<number> {
	const years = new Set<number>();
	observations.forEach((obs) => {
		const matchesCode = obs.code?.coding?.some((c) => c.code === loincCode);
		if (!matchesCode || !obs.effectiveDateTime) return;
		years.add(new Date(obs.effectiveDateTime).getFullYear());
	});
	return years;
}

const BP_SYSTOLIC_GOAL = 130; // mmHg — at goal when below this value
const BP_DIASTOLIC_GOAL = 80; // mmHg — at goal when below this value

function evaluateBPControl(observations: fhir4.Observation[]): DiabetesCareGuidelineResult {
	const name = `Blood Pressure Control (<${BP_SYSTOLIC_GOAL}/${BP_DIASTOLIC_GOAL})`;
	const bpObs = getMostRecentObservation(observations, "55284-4");

	if (!bpObs?.component) {
		return {
			name,
			status: "insufficient-data",
			detail: "No blood pressure reading found",
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
			name,
			status: "insufficient-data",
			detail: "Blood pressure reading missing systolic or diastolic value",
		};
	}

	const controlled =
		systolic < BP_SYSTOLIC_GOAL && diastolic < BP_DIASTOLIC_GOAL;
	return {
		name,
		status: controlled ? "met" : "not-met",
		detail: `Most recent reading: ${systolic.toFixed(0)}/${diastolic.toFixed(0)} mm[Hg]`,
	};
}

export const A1C_GOAL = 7; // % — at goal when below this value

function evaluateA1cControl(observations: fhir4.Observation[]): DiabetesCareGuidelineResult {
	const a1cObs = getMostRecentObservation(observations, "4548-4");

	if (!a1cObs?.valueQuantity?.value) {
		return {
			name: "HbA1c Control",
			status: "insufficient-data",
			detail: "No HbA1c reading found",
		};
	}

	const value = a1cObs.valueQuantity.value;
	const atGoal = value < A1C_GOAL;

	return {
		name: "HbA1c Control",
		status: atGoal ? "met" : "not-met",
		detail: atGoal
			? `At goal: ${value.toFixed(1)}% (<${A1C_GOAL}%)`
			: `Above goal: ${value.toFixed(1)}% (≥${A1C_GOAL}%)`,
	};
}

// Kidney Health Evaluation: both eGFR and uACR must be performed in the same year
function evaluateKidneyEvaluation(
	observations: fhir4.Observation[],
): DiabetesCareGuidelineResult {
	const name = "Kidney Health Evaluation (eGFR + uACR)";
	const egfrYears = getYearsForCode(observations, "33914-3");
	const uacrYears = getYearsForCode(observations, "14959-1");

	const commonYears = [...egfrYears].filter((year) => uacrYears.has(year));
	if (commonYears.length > 0) {
		const mostRecentCommonYear = Math.max(...commonYears);
		return {
			name,
			status: "met",
			detail: `Both eGFR and uACR performed in ${mostRecentCommonYear}`,
		};
	}

	const missing = [
		egfrYears.size === 0 ? "eGFR" : null,
		uacrYears.size === 0 ? "uACR" : null,
	]
		.filter(Boolean)
		.join(" and ");

	if (missing === "eGFR and uACR") {
		return {
			name,
			status: "insufficient-data",
			detail: "Missing eGFR and uACR",
		};
	}

	return {
		name,
		status: "not-met",
		detail: missing
			? `Missing ${missing}`
			: "eGFR and uACR performed in different years",
	};
}

// Evaluates all observation-based diabetes care guideline measures.
// Each measure derives its own "most recent" year from its own LOINC code(s),
// so a later reading of an unrelated measure (e.g. weight) can't make an
// earlier-but-present reading of another (e.g. A1c) look missing.
export function evaluateDiabetesCareGuidelines(
	observations: fhir4.Observation[],
): DiabetesCareGuidelineResult[] {
	return [
		evaluateBPControl(observations),
		evaluateA1cControl(observations),
		evaluateKidneyEvaluation(observations),
		{
			name: "Eye Exam",
			status: "insufficient-data",
			detail: `Missing eye exam records in ${new Date().getFullYear()}`,
		},
	];
}
