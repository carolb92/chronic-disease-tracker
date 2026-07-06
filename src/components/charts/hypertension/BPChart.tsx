import {
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	ReferenceLine,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
	type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransformedObservation } from "@/lib/utils";
import { formatXDate } from "@/components/charts/shared/chartUtils";

type Props = {
	observations: TransformedObservation[];
};

const chartConfig: ChartConfig = {
	systolic: { label: "Systolic", color: "#e68f05" },
	diastolic: { label: "Diastolic", color: "#3b82f6" },
};

export default function BPChart({ observations }: Props) {
	const data = observations
		.slice()
		.reverse()
		.filter((o) => o.systolic != null)
		.map((o) => ({
			date: o.date,
			systolic: o.systolic,
			diastolic: o.diastolic,
		}));

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm">Blood Pressure Trend</CardTitle>
			</CardHeader>
			<CardContent>
				{data.length > 0 ? (
					<ChartContainer config={chartConfig} className="h-72 w-full">
						<LineChart
							data={data}
							margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="date"
								tick={{ fontSize: 10 }}
								tickFormatter={formatXDate}
							/>
							<YAxis
								tick={{ fontSize: 10 }}
								unit=" mmHg"
								domain={[40, "auto"]}
							/>
							<ChartTooltip content={<ChartTooltipContent />} />
							<ChartLegend content={<ChartLegendContent />} />
							<ReferenceLine
								y={140}
								stroke="var(--color-systolic)"
								strokeDasharray="4 2"
								label={{
									value: "140",
									fill: "var(--color-systolic)",
									fontSize: 10,
									position: "insideTopRight",
								}}
							/>
							<ReferenceLine
								y={90}
								stroke="var(--color-diastolic)"
								strokeDasharray="4 2"
								label={{
									value: "90",
									fill: "var(--color-diastolic)",
									fontSize: 10,
									position: "insideTopRight",
								}}
							/>
							<Line
								type="monotone"
								dataKey="systolic"
								stroke="var(--color-systolic)"
								strokeWidth={2}
								dot={{ r: 3 }}
								activeDot={{ r: 5 }}
							/>
							<Line
								type="monotone"
								dataKey="diastolic"
								stroke="var(--color-diastolic)"
								strokeWidth={2}
								dot={{ r: 3 }}
								activeDot={{ r: 5 }}
							/>
						</LineChart>
					</ChartContainer>
				) : (
					<div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
						No blood pressure data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
