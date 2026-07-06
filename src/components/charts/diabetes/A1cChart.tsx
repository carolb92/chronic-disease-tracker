import { LineChart, Line, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransformedObservation } from "@/lib/utils";
import { formatXDate } from "@/components/charts/shared/chartUtils";
import { A1C_GOAL } from "@/lib/hedis";

type Props = {
	observations: TransformedObservation[];
};

const chartConfig: ChartConfig = {
	value: { label: "HbA1c (%)", color: "#4f46e5" },
};

export default function A1cChart({ observations }: Props) {
	const data = observations
		.slice()
		.reverse()
		.filter((o) => o.numericValue != null)
		.map((o) => ({ date: o.date, value: o.numericValue }));

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm">HbA1c Trend</CardTitle>
			</CardHeader>
			<CardContent>
				{data.length > 0 ? (
					<ChartContainer config={chartConfig} className="h-64 w-full">
						<LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={formatXDate} />
							<YAxis tick={{ fontSize: 10 }} unit="%" domain={["auto", "auto"]} />
							<ChartTooltip content={<ChartTooltipContent />} />
							<ReferenceLine
								y={A1C_GOAL}
								stroke="hsl(var(--destructive))"
								strokeDasharray="4 2"
								label={{
									value: `Goal: <${A1C_GOAL}%`,
									fill: "hsl(var(--destructive))",
									fontSize: 10,
									position: "insideTopRight",
								}}
							/>
							<Line
								type="monotone"
								dataKey="value"
								stroke="var(--color-value)"
								strokeWidth={2}
								dot={{ r: 3 }}
								activeDot={{ r: 5 }}
							/>
						</LineChart>
					</ChartContainer>
				) : (
					<div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
						No HbA1c data available
					</div>
				)}
			</CardContent>
		</Card>
	);
}
