import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Formats a date string to MM/DD/YYYY
export function formatDate(dateString: string): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
	}).format(new Date(dateString));
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
