import useFHIRResources from "@/hooks/useFHIRResources";

export default function AppPage() {
	const {
		patient,
		ptError,
		obsError,
		displayName,
		displayBDay,
		age,
		gender,
		relevantConditions,
		conditionsErr,
	} = useFHIRResources();

	if (!patient) return <div>Loading...</div>;

	return (
		<div>
			<h1>App page</h1>
			{ptError ? (
				<p>Error finding patient data</p>
			) : (
				<>
					<p>{displayName ?? "No name available"}</p>
					<p>{displayBDay ?? "No birth date available"}</p>
					<span>
						<span>{age}</span>
						<span>
							{gender?.length
								? gender[0].toUpperCase()
								: "No gender available"}
						</span>
					</span>
				</>
			)}

			{conditionsErr ? (
				<p>Error finding conditions data</p>
			) : (
				<div>{relevantConditions?.map((c) => c.code?.text).join(", ")}</div>
			)}

			{obsError ? (
				<p>Error finding observations data</p>
			) : (
				<div>observations go here</div>
			)}
		</div>
	);
}
