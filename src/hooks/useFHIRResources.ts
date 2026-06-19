import { useEffect, useState } from "react";
import FHIR from "fhirclient";
import { calculateAge } from "@/lib/utils";
import {
	TRACKED_CONDITION_SNOMED_CODES,
	DIABETES_LOINC_CODES,
	HTN_LOINC_CODES,
	HLD_LOINC_CODES,
} from "@/lib/constants";

export default function useFHIRResources() {
	const [patient, setPatient] = useState<fhir4.Patient | null>(null);
	const [observations, setObservations] = useState<fhir4.Observation[]>([]);
	const [ptError, setPtError] = useState({});
	const [obsError, setObsError] = useState({});
	const [conditions, setConditions] = useState<fhir4.Condition[]>([]);
	const [conditionsErr, setConditionsErr] = useState({});

	const trackedConditionSet = new Set(TRACKED_CONDITION_SNOMED_CODES);
	const DMLOINCCodesSet = new Set(DIABETES_LOINC_CODES);
	const HTNLOINCCodesSet = new Set(HTN_LOINC_CODES);
	const HLDLOINCCodesSet = new Set(HLD_LOINC_CODES);

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
					// console.log("observations: ", obs);
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
	const officialName = name?.find((item) => item.use === "official");
	const displayName = `${officialName?.family}, ${officialName?.given?.join(" ")}`;
	let d;
	if (birthDate) d = new Date(birthDate);
	const displayBDay = d
		? new Intl.DateTimeFormat("en-US", {
				month: "2-digit",
				day: "2-digit",
				year: "numeric",
			}).format(d)
		: null;

	const age = d ? calculateAge(d) : null;

	// CONDITIONS
	// filter for active conditions
	const activeConditions = conditions
		? conditions.filter((c) =>
				c.clinicalStatus?.coding?.find((item) => item.code === "active"),
			)
		: null;

	// filter active conditions for conditions whose SNOMED codes are in our trackedConditionsSet
	const relevantConditions = conditions
		? activeConditions?.filter((entry) =>
				entry.code?.coding?.some(
					(item) =>
						item.system === "http://snomed.info/sct" &&
						item.code &&
						trackedConditionSet.has(item.code),
				),
			)
		: null;

	console.log("relevant conditions: ", relevantConditions);

	const relevantSNOMEDCodesArr = relevantConditions?.map((c) =>
		c.code?.coding?.map((item) => item.code).flat(),
	);

	console.log("relevant SNOMED codes: ", relevantSNOMEDCodesArr);

	// filter observations (by LOINC code) based on the patient's relevant conditions
	// const ptLOINCCodes = new Set();

	// if (relevantConditionsArr?.includes("diabetes"))
	// 	ptLOINCCodes.add(DMLOINCCodesSet);
	// if (relevantConditionsArr?.includes("hypertension"))
	// 	ptLOINCCodes.add(HTN_LOINC_CODES);
	// if (
	// 	relevantConditionsArr?.includes("hyperlipidemia") ||
	// 	relevantConditionsArr?.includes("hypercholesterolemia")
	// )
	// 	ptLOINCCodes.add(HLD_LOINC_CODES);

	return {
		patient,
		observations,
		ptError,
		obsError,
		displayName,
		displayBDay,
		age,
		gender,
		relevantConditions,
		conditionsErr,
	};
}
