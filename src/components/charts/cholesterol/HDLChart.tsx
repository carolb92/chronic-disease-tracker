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
import type { TransformedObservation } from "@/lib/clinical/observations";
import {
	formatXDate,
	makeGoalDots,
	niceTicks,
} from "@/components/charts/shared/chartUtils";

type Props = {
	observations: TransformedObservation[];
	gender: string | null | undefined;
};

const chartConfig: ChartConfig = {
	value: { label: "HDL (mg/dL)", color: "#64748b" },
};

export default function HDLChart({ observations, gender }: Props) {
	// Sex-specific floor: >40 mg/dL (men), >50 mg/dL (women / unknown)
	const goal = gender === "male" ? 40 : 50;

	const latest = observations[0];
	const hdlAtGoal =
		latest?.numericValue != null ? latest.numericValue >= goal : null;

	const data = observations
		.slice()
		.reverse()
		.filter((o) => o.numericValue != null)
		.map((o) => ({ date: o.date, value: o.numericValue as number }));

	const rawMin =
		data.length > 0 ? Math.min(...data.map((d) => d.value)) : goal - 20;
	const rawMax =
		data.length > 0 ? Math.max(...data.map((d) => d.value)) : goal + 30;
	const paddedMin = Math.max(0, Math.min(rawMin - 5, goal - 15));
	const paddedMax = Math.max(rawMax + 10, goal + 25);
	const yTicks = niceTicks(paddedMin, paddedMax);
	const yMin = yTicks[0];
	const yMax = yTicks[yTicks.length - 1];

	const { dot, activeDot } = makeGoalDots(goal, "gte");

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between gap-4">
					<div>
						<CardTitle className="text-base">HDL Cholesterol</CardTitle>
						{latest?.numericValue != null && (
							<p className="mt-0.5 text-xs text-muted-foreground">
								Most recent: {latest.date}
							</p>
						)}
					</div>
					{hdlAtGoal !== null && (
						<span
							className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
								hdlAtGoal
									? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
									: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
							}`}
						>
							{hdlAtGoal ? "At Goal" : "Below Goal"}
						</span>
					)}
				</div>
				{/* //TODO: double check this */}
				<p className="text-xs text-muted-foreground">
					HDL ("good") cholesterol helps your body remove excess LDL ("bad")
					cholesterol –– a higher value is better
				</p>
			</CardHeader>
			<CardContent>
				{data.length > 0 ? (
					<ChartContainer config={chartConfig} className="h-64 w-full">
						<LineChart
							data={data}
							margin={{ top: 8, right: 60, left: 0, bottom: 0 }}
						>
							<ReferenceArea
								y1={yMin}
								y2={goal}
								fill="#ef4444"
								fillOpacity={0.15}
								ifOverflow="visible"
							/>
							<ReferenceArea
								y1={goal}
								y2={yMax}
								fill="#22c55e"
								fillOpacity={0.15}
								ifOverflow="visible"
								label={{
									value: "Protective range",
									position: "insideTopLeft",
									fill: "#15803d",
									fontSize: 10,
									fontStyle: "italic",
								}}
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
								domain={[yMin, yMax]}
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
									value: `Goal: >${goal} mg/dL (${gender === "male" ? "men" : "women"})`,
									position: "insideBottomRight",
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
						No HDL data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
