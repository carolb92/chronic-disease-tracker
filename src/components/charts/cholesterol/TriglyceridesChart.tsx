import {
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	ReferenceLine,
	ReferenceArea,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransformedObservation } from "@/lib/utils";
import { formatXDate } from "@/components/charts/shared/chartUtils";

type Props = { observations: TransformedObservation[] };

const chartConfig: ChartConfig = {
	value: { label: "Triglycerides (mg/dL)", color: "#64748b" },
};

// Thresholds are exclusive upper bounds: value < max → this band
const BANDS = [
	{ max: 150, label: "Normal", range: "<150", fill: "#22c55e", badgeCls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
	{ max: 200, label: "Borderline High", range: "150–199", fill: "#eab308", badgeCls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
	{ max: 500, label: "High", range: "200–499", fill: "#f97316", badgeCls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
	{ max: Infinity, label: "Very High", range: "≥500", fill: "#ef4444", badgeCls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
];

function getBand(value: number) {
	return BANDS.find((b) => value < b.max) ?? BANDS[BANDS.length - 1];
}

function getDotColor(value: number): string {
	return getBand(value).fill;
}

export default function TriglyceridesChart({ observations }: Props) {
	const latest = observations[0];
	const currentBand = latest?.numericValue != null ? getBand(latest.numericValue) : null;

	const data = observations
		.slice()
		.reverse()
		.filter((o) => o.numericValue != null)
		.map((o) => ({ date: o.date, value: o.numericValue as number }));

	const rawMax = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 100;
	// Always show all four bands including Very High (≥500)
	const yMax = Math.max(rawMax + 50, 560);

	const dot = (props: { cx?: number; cy?: number; value?: number; index?: number }) => {
		if (props.cx == null || props.cy == null || props.value == null) return null;
		return (
			<circle
				key={`dot-${props.index}`}
				cx={props.cx}
				cy={props.cy}
				r={4.5}
				fill={getDotColor(props.value)}
				stroke="white"
				strokeWidth={1.5}
			/>
		);
	};

	const activeDot = (props: { cx?: number; cy?: number; value?: number; index?: number }) => {
		if (props.cx == null || props.cy == null || props.value == null) return null;
		return (
			<circle
				key={`active-dot-${props.index}`}
				cx={props.cx}
				cy={props.cy}
				r={6}
				fill={getDotColor(props.value)}
				stroke="white"
				strokeWidth={2}
			/>
		);
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					<div>
						<CardTitle className="text-base">Triglycerides</CardTitle>
						{latest?.numericValue != null && (
							<p className="mt-0.5 text-xs text-muted-foreground">
								Most recent: {latest.date}
							</p>
						)}
					</div>
					{currentBand && (
						<span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${currentBand.badgeCls}`}>
							{currentBand.label}
						</span>
					)}
				</div>
				<p className="text-xs text-muted-foreground/70">
					Fat particles in the blood — lower levels reduce your risk of heart disease and pancreatitis
				</p>
			</CardHeader>
			<CardContent>
				{data.length > 0 ? (
					<>
						<ChartContainer config={chartConfig} className="h-64 w-full">
							<LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
								<ReferenceArea y1={0} y2={150} fill="#22c55e" fillOpacity={0.15} ifOverflow="visible" />
								<ReferenceArea y1={150} y2={200} fill="#eab308" fillOpacity={0.15} ifOverflow="visible" />
								<ReferenceArea y1={200} y2={500} fill="#f97316" fillOpacity={0.15} ifOverflow="visible" />
								<ReferenceArea y1={500} y2={yMax} fill="#ef4444" fillOpacity={0.15} ifOverflow="visible" />
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="date"
									tick={{ fontSize: 10 }}
									tickFormatter={formatXDate}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									tick={{ fontSize: 10 }}
									domain={[0, yMax]}
									ticks={[0, 150, 200, 500]}
									axisLine={false}
									tickLine={false}
								/>
								<ChartTooltip
									content={
										<ChartTooltipContent
											formatter={(value) => {
												const v = Math.round(Number(value));
												return [`${v} mg/dL · ${getBand(v).label}`];
											}}
										/>
									}
								/>
								<ReferenceLine y={150} stroke="#eab308" strokeDasharray="4 3" strokeWidth={1} />
								<ReferenceLine y={200} stroke="#f97316" strokeDasharray="4 3" strokeWidth={1} />
								<ReferenceLine y={500} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1} />
								<Line
									type="monotone"
									dataKey="value"
									stroke="#94a3b8"
									strokeWidth={2}
									dot={dot}
									activeDot={activeDot}
								/>
							</LineChart>
						</ChartContainer>
						<div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 px-1">
							{BANDS.map((band) => (
								<span key={band.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<span
										className="inline-block h-2.5 w-2.5 rounded-full"
										style={{ backgroundColor: band.fill }}
									/>
									{band.label}
									<span className="text-muted-foreground/50">({band.range})</span>
								</span>
							))}
						</div>
					</>
				) : (
					<div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
						No triglycerides data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
