import type { TransformedObservation } from "@/lib/utils";
import type { HedisMeasureResult } from "@/lib/hedis";
import MetricCard, { type MetricStatus } from "./MetricCard";
import A1cChart from "@/components/charts/diabetes/A1cChart";
import GlucoseChart from "@/components/charts/diabetes/GlucoseChart";
import DiabetesCareChecklist from "@/components/charts/diabetes/DiabetesCareChecklist";

type Props = {
	groupedObservations: Record<string, TransformedObservation[]>;
	diabetesHedisMeasures: HedisMeasureResult[] | null;
};

export default function DiabetesTabContent({
	groupedObservations,
	diabetesHedisMeasures,
}: Props) {
	const latestA1c = groupedObservations["4548-4"]?.[0];
	const latestGlucose = groupedObservations["1558-6"]?.[0];
	const metCount = (diabetesHedisMeasures ?? []).filter((m) => m.status === "met").length;
	const totalCount = diabetesHedisMeasures?.length ?? 0;

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

	const glucoseStatus: MetricStatus =
		latestGlucose?.numericValue == null
			? "neutral"
			: latestGlucose.numericValue >= 80 && latestGlucose.numericValue < 130
				? "good"
				: "bad";

	const checklistStatus: MetricStatus =
		diabetesHedisMeasures && totalCount > 0 && metCount === totalCount
			? "good"
			: "neutral";

	const metrics = [
		{ label: "HbA1c", value: a1cValue, subtext: latestA1c?.date, status: a1cStatus },
		{ label: "Fasting Glucose", value: glucoseValue, subtext: latestGlucose?.date, status: glucoseStatus },
		{ label: "Diabetes Care Checklist", value: diabetesHedisMeasures ? `${metCount}/${totalCount} met` : "—", status: checklistStatus },
	];

	return (
		<div className="flex flex-col gap-4 pt-1">
			<div className="grid grid-cols-3 gap-3">
				{metrics.map(({ label, value, subtext, status }) => (
					<MetricCard key={label} label={label} value={value} subtext={subtext} status={status} />
				))}
			</div>

			<A1cChart observations={groupedObservations["4548-4"] ?? []} />
			<GlucoseChart observations={groupedObservations["1558-6"] ?? []} />

			{diabetesHedisMeasures && diabetesHedisMeasures.length > 0 && (
				<DiabetesCareChecklist measures={diabetesHedisMeasures} />
			)}
		</div>
	);
}
