// Computes ticks at a "nice" interval such that both min and max land exactly
// on a tick — preventing Recharts from appending a stray domain-boundary label.
export function niceTicks(min: number, max: number, targetCount = 5): number[] {
	const span = max - min;
	if (span === 0) return [min];
	const rawStep = span / (targetCount - 1);
	const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
	const step =
		[1, 2, 2.5, 5, 10].map((f) => f * magnitude).find((s) => s >= rawStep) ??
		magnitude * 10;
	const lo = Math.floor(min / step) * step;
	const hi = Math.ceil(max / step) * step;
	const ticks: number[] = [];
	for (let t = lo; t <= hi + step * 0.001; t += step) {
		ticks.push(Math.round(t));
	}
	return ticks;
}

export type DotProps = {
	cx?: number;
	cy?: number;
	value?: number;
	index?: number;
};

export const formatXDate = (d: string) => {
	const parts = d.split("/");
	return `${parts[0]}/${parts[2]?.slice(2)}`;
};

// "lte" = at goal when value <= goal (LDL, triglycerides, non-HDL)
// "gte" = at goal when value >= goal (HDL)
export type GoalDirection = "lte" | "gte";

export function makeGoalDots(goal: number, direction: GoalDirection) {
	const isAtGoal = (v: number) => (direction === "lte" ? v <= goal : v >= goal);

	const dot = (props: DotProps) => {
		if (props.cx == null || props.cy == null) return null;
		const atGoal = props.value != null && isAtGoal(props.value);
		return (
			<circle
				key={`dot-${props.index}`}
				cx={props.cx}
				cy={props.cy}
				r={4.5}
				fill={atGoal ? "#16a34a" : "#dc2626"}
				stroke="white"
				strokeWidth={1.5}
			/>
		);
	};

	const activeDot = (props: DotProps) => {
		if (props.cx == null || props.cy == null) return null;
		const atGoal = props.value != null && isAtGoal(props.value);
		return (
			<circle
				key={`active-dot-${props.index}`}
				cx={props.cx}
				cy={props.cy}
				r={6}
				fill={atGoal ? "#16a34a" : "#dc2626"}
				stroke="white"
				strokeWidth={2}
			/>
		);
	};

	return { dot, activeDot };
}
