import type { TransformedObservation } from "@/lib/utils";
import MetricCard, { type MetricStatus } from "./MetricCard";
import BPChart from "@/components/charts/hypertension/BPChart";

type Props = {
	groupedObservations: Record<string, TransformedObservation[]>;
};

export default function HypertensionTabContent({ groupedObservations }: Props) {
	const latestBP = groupedObservations["55284-4"]?.[0];
	const systolicValue =
		latestBP?.systolic != null ? `${latestBP.systolic.toFixed(0)} mmHg` : "—";
	const diastolicValue =
		latestBP?.diastolic != null ? `${latestBP.diastolic.toFixed(0)} mmHg` : "—";

	const goalMet =
		latestBP?.systolic != null && latestBP?.diastolic != null
			? latestBP.systolic < 140 && latestBP.diastolic < 90
			: null;

	const systolicStatus: MetricStatus =
		latestBP?.systolic == null ? "neutral" : latestBP.systolic < 140 ? "good" : "bad";
	const diastolicStatus: MetricStatus =
		latestBP?.diastolic == null ? "neutral" : latestBP.diastolic < 90 ? "good" : "bad";
	const goalStatus: MetricStatus =
		goalMet === null ? "neutral" : goalMet ? "good" : "bad";

	const metrics = [
		{ label: "Systolic", value: systolicValue, subtext: latestBP?.date, status: systolicStatus },
		{ label: "Diastolic", value: diastolicValue, subtext: latestBP?.date, status: diastolicStatus },
		{ label: "BP Goal (<140/90)", value: goalMet === null ? "—" : goalMet ? "Met" : "Not Met", subtext: latestBP ? "most recent reading" : undefined, status: goalStatus },
	];

	return (
		<div className="flex flex-col gap-4 pt-1">
			<div className="grid grid-cols-3 gap-3">
				{metrics.map(({ label, value, subtext, status }) => (
					<MetricCard key={label} label={label} value={value} subtext={subtext} status={status} />
				))}
			</div>

			<BPChart observations={groupedObservations["55284-4"] ?? []} />
		</div>
	);
}
