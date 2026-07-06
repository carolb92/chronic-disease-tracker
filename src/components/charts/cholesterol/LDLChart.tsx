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
import {
	formatXDate,
	makeGoalDots,
	niceTicks,
} from "@/components/charts/shared/chartUtils";

type Props = {
	observations: TransformedObservation[];
	goal: number;
};

const chartConfig: ChartConfig = {
	value: { label: "LDL (mg/dL)", color: "#64748b" },
};

const Y_MIN = 40;

export default function LDLChart({ observations, goal }: Props) {
	const latest = observations[0];
	const ldlAtGoal =
		latest?.numericValue != null ? latest.numericValue <= goal : null;

	const data = observations
		.slice()
		.reverse()
		.filter((o) => o.numericValue != null)
		.map((o) => ({ date: o.date, value: o.numericValue as number }));

	const paddedMax =
		data.length > 0
			? Math.max(...data.map((d) => d.value), goal + 30) + 20
			: goal + 70;
	const yTicks = niceTicks(Y_MIN, paddedMax);
	const yMax = yTicks[yTicks.length - 1];

	const { dot, activeDot } = makeGoalDots(goal, "lte");

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					<div>
						<CardTitle className="text-base">LDL Cholesterol</CardTitle>
						{latest?.numericValue != null && (
							<p className="mt-0.5 text-xs text-muted-foreground">
								Most recent: {latest.date}
							</p>
						)}
					</div>
					{ldlAtGoal !== null && (
						<span
							className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
								ldlAtGoal
									? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
									: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
							}`}
						>
							{ldlAtGoal ? "At Goal" : "Above Goal"}
						</span>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{data.length > 0 ? (
					<ChartContainer config={chartConfig} className="h-64 w-full">
						<LineChart
							data={data}
							margin={{ top: 8, right: 60, left: 0, bottom: 0 }}
						>
							<ReferenceArea
								y1={Y_MIN}
								y2={goal}
								fill="#22c55e"
								fillOpacity={0.15}
								ifOverflow="visible"
							/>
							<ReferenceArea
								y1={goal}
								y2={yMax}
								fill="#ef4444"
								fillOpacity={0.15}
								ifOverflow="visible"
							/>
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
								domain={[Y_MIN, yMax]}
								ticks={yTicks}
								axisLine={false}
								tickLine={false}
								tickFormatter={(v) => Math.round(v).toString()}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										formatter={(value) => [
											`${Math.round(Number(value))} mg/dL`,
										]}
									/>
								}
							/>
							<ReferenceLine
								y={goal}
								stroke="#94a3b8"
								strokeDasharray="6 3"
								strokeWidth={1.5}
								label={{
									value: `Goal: <${goal} mg/dL`,
									position: "insideTopRight",
									fill: "#94a3b8",
									fontSize: 11,
									fontWeight: 500,
									offset: 8,
								}}
							/>
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
				) : (
					<div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
						No LDL data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
