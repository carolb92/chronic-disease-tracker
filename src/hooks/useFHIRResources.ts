import { useEffect, useState } from "react";
import FHIR from "fhirclient";
import {
	calculateAge,
	formatDate,
	groupAndSortObservations,
} from "@/lib/utils";
import {
	TRACKED_CONDITION_SNOMED_CODES,
	SNOMED_TO_LOINC,
	DM_SNOMED_CODES,
	DIABETES_LOINC_CODES,
} from "@/lib/constants";
import { evaluateDiabetesHedisMeasures } from "@/lib/hedis";

export default function useFHIRResources() {
	const [patient, setPatient] = useState<fhir4.Patient | null>(null);
	const [observations, setObservations] = useState<fhir4.Observation[]>([]);
	const [ptError, setPtError] = useState<Error | null>(null);
	const [obsError, setObsError] = useState<Error | null>(null);
	const [conditions, setConditions] = useState<fhir4.Condition[]>([]);
	const [conditionsErr, setConditionsErr] = useState<Error | null>(null);

	const trackedConditionSet = new Set(TRACKED_CONDITION_SNOMED_CODES);

	useEffect(() => {
		FHIR.oauth2.ready().then((client) => {
			// PATIENT RESOURCE
			client.patient
				.read()
				.then((pt) => {
					setPatient(pt);
				})
				.catch((err) => {
					console.error("Failed to read patient:", err);
					setPtError(err);
				});

			// CONDITIONS RESOURCE
			client
				.request("/Condition?patient=" + client.patient.id, { flat: true })
				.then((c) => {
					setConditions(c);
				})
				.catch((err) => {
					console.error("Failed to retrieve patient conditions: ", err);
					setConditionsErr(err);
				});

			// OBSERVATIONS RESOURCE
			client
				.request("/Observation?patient=" + client.patient.id, { flat: true })
				.then((obs) => {
					setObservations(obs);
				})
				.catch((err) => {
					console.error("failed to retrieve patient observations: ", err);
					setObsError(err);
				});
		});
	}, []);

	// PATIENT DEMOGRAPHICS
	const name = patient ? patient.name : null;
	const birthDate = patient ? patient.birthDate : null;
	const gender = patient ? patient.gender : null;
	const bestName =
		name?.find((item) => item.use === "official") ??
		name?.find((item) => item.use === "usual") ??
		name?.[0];
	const displayName = bestName
		? `${bestName.family}, ${bestName.given?.join(" ")}`
		: null;
	let d;
	if (birthDate) d = new Date(birthDate);
	const displayBDay = d ? formatDate(birthDate!) : null;

	const age = d ? calculateAge(d) : null;

	// CONDITIONS
	const activeConditions = conditions.filter((c) =>
		c.clinicalStatus?.coding?.find((item) => item.code === "active"),
	);

	const relevantConditions = activeConditions.filter((entry) =>
		entry.code?.coding?.some(
			(item) =>
				item.system === "http://snomed.info/sct" &&
				item.code &&
				trackedConditionSet.has(item.code),
		),
	);

	console.log("relevant conditions: ", relevantConditions);

	const relevantSNOMEDCodes = relevantConditions
		.flatMap((entry) =>
			entry.code?.coding?.map((item) => {
				if (item.system === "http://snomed.info/sct") return item.code;
			}),
		)
		.filter((item) => item !== undefined);
	console.log("relevant SNOMED codes: ", relevantSNOMEDCodes);

	// build a set of relevant LOINC codes from the patient's conditions
	const ptLOINCCodes = new Set<string>();
	relevantConditions.forEach((condition) => {
		condition.code?.coding?.forEach((coding) => {
			if (coding.code && coding.code in SNOMED_TO_LOINC) {
				for (const loinc of SNOMED_TO_LOINC[coding.code]) {
					ptLOINCCodes.add(loinc);
				}
			}
		});
	});

	const relevantObservations = observations.filter((obs) =>
		obs.code?.coding?.some(
			(coding) =>
				coding.system === "http://loinc.org" &&
				coding.code &&
				ptLOINCCodes.has(coding.code),
		),
	);

	const groupedObservations = groupAndSortObservations(relevantObservations);

	const hasDiabetes = relevantSNOMEDCodes.some((code) =>
		DM_SNOMED_CODES.includes(code),
	);

	// Scope measurement year to diabetes observations only so HTN/HLD readings
	// from a later year don't push the window past the patient's actual DM labs
	const diabetesLOINCSet = new Set(DIABETES_LOINC_CODES);
	const measurementYear = relevantObservations
		.filter((obs) =>
			obs.code?.coding?.some(
				(c) =>
					c.system === "http://loinc.org" &&
					c.code &&
					diabetesLOINCSet.has(c.code),
			),
		)
		.reduce<number | null>((latest, obs) => {
			const year = obs.effectiveDateTime
				? new Date(obs.effectiveDateTime).getFullYear()
				: null;
			if (year == null) return latest;
			return latest == null || year > latest ? year : latest;
		}, null);

	const diabetesHedisMeasures =
		hasDiabetes && measurementYear
			? evaluateDiabetesHedisMeasures(relevantObservations, measurementYear)
			: null;

	return {
		patient,
		groupedObservations,
		diabetesHedisMeasures,
		measurementYear,
		ptError,
		obsError,
		displayName,
		displayBDay,
		age,
		gender,
		relevantConditions,
		conditionsErr,
		relevantSNOMEDCodes,
	};
}
