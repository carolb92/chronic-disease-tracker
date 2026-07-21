import type { TransformedObservation } from "@/lib/clinical/observations";
import type { DiabetesCareGuidelineResult } from "@/lib/diabetesCareGuidelines";
import MetricCard, { type MetricStatus } from "./MetricCard";
import A1cChart from "@/components/charts/diabetes/A1cChart";
import GlucoseChart, { type GlucoseType } from "@/components/charts/diabetes/GlucoseChart";
import DiabetesCareChecklist from "@/components/charts/diabetes/DiabetesCareChecklist";
import { RANDOM_GLUCOSE_CODES } from "@/lib/constants";

type Props = {
	groupedObservations: Record<string, TransformedObservation[]>;
	diabetesCareGuidelines: DiabetesCareGuidelineResult[] | null;
};

export default function DiabetesTabContent({
	groupedObservations,
	diabetesCareGuidelines,
}: Props) {
	const latestA1c = groupedObservations["4548-4"]?.[0];
	const metCount = (diabetesCareGuidelines ?? []).filter((m) => m.status === "met").length;
	const totalCount = diabetesCareGuidelines?.length ?? 0;

	// Prefer fasting glucose; fall back to first available BMP glucose code
	const fastingObs = groupedObservations["1558-6"] ?? [];
	const randomGlucoseCode = RANDOM_GLUCOSE_CODES.find(
		(code) => (groupedObservations[code]?.length ?? 0) > 0,
	);
	const hasFasting = fastingObs.length > 0;
	const glucoseType: GlucoseType = hasFasting ? "fasting" : "random";
	const glucoseObservations = hasFasting
		? fastingObs
		: (randomGlucoseCode ? groupedObservations[randomGlucoseCode] : []) ?? [];
	const latestGlucose = glucoseObservations[0];

	console.log("[Glucose] fasting (1558-6):", groupedObservations["1558-6"] ?? []);
	console.log("[Glucose] random (2345-7):", groupedObservations["2345-7"] ?? []);
	console.log("[Glucose] random (2339-0):", groupedObservations["2339-0"] ?? []);
	console.log("[Glucose] using:", glucoseType, "→", glucoseObservations);

	const a1cValue =
		latestA1c?.numericValue != null ? `${latestA1c.numericValue.toFixed(1)}%` : "—";
	const glucoseValue =
		latestGlucose?.numericValue != null
			? `${latestGlucose.numericValue.toFixed(0)} mg/dL`
			: "—";

	const a1cStatus: MetricStatus =
		latestA1c?.numericValue == null
			? "neutral"
			: latestA1c.numericValue < 8
				? "good"
				: latestA1c.numericValue > 9
					? "bad"
					: "neutral";

	const glucoseStatus: MetricStatus = (() => {
		const v = latestGlucose?.numericValue;
		if (v == null || glucoseType === "random") return "neutral";
		return v >= 80 && v < 130 ? "good" : "bad";
	})();

	const checklistStatus: MetricStatus =
		diabetesCareGuidelines && totalCount > 0 && metCount === totalCount
			? "good"
			: "neutral";

	const glucoseLabel = glucoseType === "fasting" ? "Fasting Glucose" : "Blood Glucose";

	const metrics = [
		{ label: "HbA1c", value: a1cValue, subtext: latestA1c?.date, status: a1cStatus },
		{ label: glucoseLabel, value: glucoseValue, subtext: latestGlucose?.date, status: glucoseStatus },
		{ label: "Diabetes Care Checklist", value: diabetesCareGuidelines ? `${metCount}/${totalCount} met` : "—", status: checklistStatus },
	];

	return (
		<div className="flex flex-col gap-4 pt-1">
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				{metrics.map(({ label, value, subtext, status }) => (
					<MetricCard key={label} label={label} value={value} subtext={subtext} status={status} />
				))}
			</div>

			<A1cChart observations={groupedObservations["4548-4"] ?? []} />
			<GlucoseChart observations={glucoseObservations} glucoseType={glucoseType} />

			{diabetesCareGuidelines && diabetesCareGuidelines.length > 0 && (
				<DiabetesCareChecklist measures={diabetesCareGuidelines} />
			)}
		</div>
	);
}
