import { calculateAge, formatDate } from "@/lib/utils";

export type DisplayDemographics = {
	displayName: string | null;
	displayBDay: string | null;
	age: number | null;
	gender: fhir4.Patient["gender"] | null;
};

// Derives header/demographic display fields from a FHIR Patient resource
export function deriveDisplayDemographics(
	patient: fhir4.Patient | null,
): DisplayDemographics {
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

	return { displayName, displayBDay, age, gender: gender ?? null };
}
