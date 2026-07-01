import type { TransformedObservation } from "@/lib/utils";
import MetricCard, { type MetricStatus } from "./MetricCard";
import LDLChart from "@/components/charts/cholesterol/LDLChart";
import HDLChart from "@/components/charts/cholesterol/HDLChart";
import TriglyceridesChart from "@/components/charts/cholesterol/TriglyceridesChart";
import NonHDLChart from "@/components/charts/cholesterol/NonHDLChart";

// Will be derived from ASCVD risk in the future
const LDL_GOAL = 100; // mg/dL
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
					(groupedObservations["2085-9"] ?? []).map((o) => [o.isoDate, o]),
				);
				return totalObs
					.filter((total) => {
						const hdl = hdlByDate.get(total.isoDate);
						return (
							total.numericValue != null &&
							hdl?.numericValue != null &&
							total.unit != null &&
							total.unit === hdl.unit
						);
					})
					.map((total) => {
						const hdl = hdlByDate.get(total.isoDate)!;
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
			: latestLDL.numericValue < 100
				? "good"
				: latestLDL.numericValue >= 130
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
			<div className="grid grid-cols-3 gap-3">
				{metrics.map(({ label, value, subtext, status }) => (
					<MetricCard
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
		</div>
	);
}
