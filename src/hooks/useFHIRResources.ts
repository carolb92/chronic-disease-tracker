import { useEffect, useMemo, useState } from "react";
import FHIR from "fhirclient";
import { deriveClinicalView } from "@/lib/clinical/deriveClinicalView";

export default function useFHIRResources() {
	const [patient, setPatient] = useState<fhir4.Patient | null>(null);
	const [observations, setObservations] = useState<fhir4.Observation[]>([]);
	const [ptError, setPtError] = useState<Error | null>(null);
	const [obsError, setObsError] = useState<Error | null>(null);
	const [conditions, setConditions] = useState<fhir4.Condition[]>([]);
	const [conditionsErr, setConditionsErr] = useState<Error | null>(null);

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

	const clinicalView = useMemo(
		() => deriveClinicalView(patient, conditions, observations),
		[patient, conditions, observations],
	);

	return {
		patient,
		ptError,
		obsError,
		conditionsErr,
		...clinicalView,
	};
}
