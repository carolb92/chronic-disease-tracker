import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

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

// Formats a date string to MM/DD/YYYY
export function formatDate(dateString: string): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
	}).format(new Date(dateString));
}

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

export function calculateAge(birthDate: Date) {
	const today = new Date();
	const bMonth = birthDate.getMonth() + 1;
	const bDay = birthDate.getDate();
	const bYear = birthDate.getFullYear();

	const tMonth = today.getMonth() + 1;
	const tDay = today.getDate();
	const tYear = today.getFullYear();
	const yearDiff = tYear - bYear;

	// this assumes the birthday has happened already
	let age = yearDiff;

	// if the birth date has not passed yet, subtract 1 from yearDiff
	if (tMonth < bMonth) age = yearDiff - 1;

	// check if the months are the same
	if (bMonth === tMonth) {
		// if the difference between the current day and the birthday is < 0, the birth date has not passed yet
		if (tDay - bDay < 0) age = yearDiff - 1;
	}
	return age;
}
