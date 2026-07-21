import {
	TRACKED_CONDITION_SNOMED_CODES,
	SNOMED_TO_LOINC,
	DM_SNOMED_CODES,
} from "@/lib/constants";
import { evaluateDiabetesCareGuidelines } from "@/lib/diabetesCareGuidelines";
import { deriveDisplayDemographics } from "./demographics";
import {
	extractSNOMEDCodes,
	filterRelevantConditions,
	hasAnyCode,
} from "./conditions";
import {
	deriveRelevantLOINCCodes,
	filterRelevantObservations,
	groupAndSortObservations,
} from "./observations";

// Composes the pure clinical-derivation pipeline: raw FHIR resources in,
// display-ready view model out.
export function deriveClinicalView(
	patient: fhir4.Patient | null,
	conditions: fhir4.Condition[],
	observations: fhir4.Observation[],
) {
	const { displayName, displayBDay, age, gender } =
		deriveDisplayDemographics(patient);

	const relevantConditions = filterRelevantConditions(
		conditions,
		TRACKED_CONDITION_SNOMED_CODES,
	);

	const relevantSNOMEDCodes = extractSNOMEDCodes(relevantConditions);

	const relevantLOINCCodes = deriveRelevantLOINCCodes(
		relevantConditions,
		SNOMED_TO_LOINC,
	);

	const relevantObservations = filterRelevantObservations(
		observations,
		relevantLOINCCodes,
	);

	const groupedObservations = groupAndSortObservations(relevantObservations);

	const hasDiabetes = hasAnyCode(relevantSNOMEDCodes, DM_SNOMED_CODES);

	const diabetesCareGuidelines = hasDiabetes
		? evaluateDiabetesCareGuidelines(relevantObservations)
		: null;

	return {
		groupedObservations,
		diabetesCareGuidelines,
		displayName,
		displayBDay,
		age,
		gender,
		relevantConditions,
		relevantSNOMEDCodes,
	};
}
