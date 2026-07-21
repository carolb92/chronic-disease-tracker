import type { TransformedObservation } from "@/lib/utils";
import MetricCard, { type MetricStatus } from "./MetricCard";
import LDLChart from "@/components/charts/cholesterol/LDLChart";
import HDLChart from "@/components/charts/cholesterol/HDLChart";
import TriglyceridesChart from "@/components/charts/cholesterol/TriglyceridesChart";
import NonHDLChart from "@/components/charts/cholesterol/NonHDLChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Will be derived from ASCVD risk in the future
const LDL_GOAL = 100; // mg/dL
//TODO: double check bad LDL threshold
const LDL_BAD_THRESHOLD = LDL_GOAL + 30; // mg/dL — borderline high per ACC/AHA
// reference for non-HDL goal: https://www.urmc.rochester.edu/encyclopedia/content?contenttypeid=167&contentid=lipid_panel_nonhdl
const NON_HDL_GOAL = LDL_GOAL + 30; // mg/dL

type Props = {
	groupedObservations: Record<string, TransformedObservation[]>;
	gender: string | null | undefined;
};

export default function CholesterolTabContent({
	groupedObservations,
	gender,
}: Props) {
	const ldlCode =
		(groupedObservations["2089-1"]?.length ?? 0) > 0 ? "2089-1" : "18262-6";

	const TRIGLYCERIDES_CODES = ["2571-8", "47210-0", "3043-7"];
	const triglyceridesCode =
		TRIGLYCERIDES_CODES.find(
			(code) => (groupedObservations[code]?.length ?? 0) > 0,
		) ?? "2571-8";

	// Non-HDL: use direct measurement if available, otherwise derive from total − HDL (same draw)
	const directNonHDL = groupedObservations["43396-1"] ?? [];
	const isDerivedNonHDL = directNonHDL.length === 0;
	const nonHDLObservations: TransformedObservation[] = isDerivedNonHDL
		? (() => {
				const totalObs = groupedObservations["2093-3"] ?? [];
				const hdlByDate = new Map(
					(groupedObservations["2085-9"] ?? []).map((o) => [
						o.isoDate.slice(0, 10),
						o,
					]),
				);
				return totalObs
					.filter((total) => {
						const hdl = hdlByDate.get(total.isoDate.slice(0, 10));
						return (
							total.numericValue != null &&
							hdl?.numericValue != null
						);
					})
					.map((total) => {
						const hdl = hdlByDate.get(total.isoDate.slice(0, 10))!;
						const nonHDLValue = total.numericValue! - hdl.numericValue!;
						return {
							code: "derived-non-hdl",
							display: "Non-HDL Cholesterol",
							value: `${nonHDLValue.toFixed(0)} ${total.unit ?? "mg/dL"}`,
							date: total.date,
							isoDate: total.isoDate,
							numericValue: nonHDLValue,
							unit: total.unit,
						} satisfies TransformedObservation;
					});
			})()
		: directNonHDL;

	const latestLDL = groupedObservations[ldlCode]?.[0];
	const latestHDL = groupedObservations["2085-9"]?.[0];
	const latestTotal = groupedObservations["2093-3"]?.[0];

	const ldlStatus: MetricStatus =
		latestLDL?.numericValue == null
			? "neutral"
			: latestLDL.numericValue < LDL_GOAL
				? "good"
				: latestLDL.numericValue >= LDL_BAD_THRESHOLD
					? "bad"
					: "neutral";

	const hdlLow = gender === "female" ? 50 : 40;
	const hdlStatus: MetricStatus =
		latestHDL?.numericValue == null
			? "neutral"
			: latestHDL.numericValue > 60
				? "good"
				: latestHDL.numericValue < hdlLow
					? "bad"
					: "neutral";

	const totalStatus: MetricStatus =
		latestTotal?.numericValue == null
			? "neutral"
			: latestTotal.numericValue < 200
				? "good"
				: latestTotal.numericValue >= 240
					? "bad"
					: "neutral";

	const ldlValue =
		latestLDL?.numericValue != null
			? `${latestLDL.numericValue.toFixed(0)} mg/dL`
			: "—";
	const hdlValue =
		latestHDL?.numericValue != null
			? `${latestHDL.numericValue.toFixed(0)} mg/dL`
			: "—";
	const totalValue =
		latestTotal?.numericValue != null
			? `${latestTotal.numericValue.toFixed(0)} mg/dL`
			: "—";

	const metrics = [
		{
			label: "LDL",
			value: ldlValue,
			subtext: latestLDL?.date,
			status: ldlStatus,
		},
		{
			label: "HDL",
			value: hdlValue,
			subtext: latestHDL?.date,
			status: hdlStatus,
		},
		{
			label: "Total Cholesterol",
			value: totalValue,
			subtext: latestTotal?.date,
			status: totalStatus,
		},
	];

	return (
		<div className="flex flex-col gap-4 pt-1">
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				{metrics.map(({ label, value, subtext, status }) => (
					<MetricCard
						key={label}
						label={label}
						value={value}
						subtext={subtext}
						status={status}
					/>
				))}
			</div>

			<LDLChart
				observations={groupedObservations[ldlCode] ?? []}
				goal={LDL_GOAL}
			/>
			<HDLChart
				observations={groupedObservations["2085-9"] ?? []}
				gender={gender}
			/>
			<TriglyceridesChart
				observations={groupedObservations[triglyceridesCode] ?? []}
			/>
			<NonHDLChart
				observations={nonHDLObservations}
				goal={NON_HDL_GOAL}
				isDerived={isDerivedNonHDL}
			/>

			<Card className="bg-primary/10">
				<CardHeader>
					<CardTitle className="font-semibold">Disclaimer</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="font-semibold text-muted-foreground mb-1">
						Limitation: cholesterol targets are not risk-stratified
					</p>
					<p className="">
						LDL and Non-HDL goals shown here (LDL &lt;100 mg/dL, Non-HDL &lt;130
						mg/dL) are fixed values applied to all patients — they do not
						account for individual ASCVD risk category. Per{" "}
						<a
							href="https://www.ahajournals.org/doi/10.1161/CIR.0000000000001423"
							target="_blank"
							rel="noopener noreferrer"
							className="font-semibold text-primary"
						>
							{" "}
							current ACC/AHA guidance
						</a>
						, LDL-C goals range from &lt;100 mg/dL (borderline/intermediate
						risk) to &lt;70 mg/dL (high risk) to &lt;55 mg/dL (very-high-risk
						secondary prevention). This app does not calculate ASCVD risk (e.g.,
						via the AHA PREVENT equations), so it cannot select the correct goal
						tier per patient — a high-risk or secondary-prevention patient will
						see an artificially lenient "at goal" status. This is a v1 scope
						limitation; risk-stratified goals are deferred to v2.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
