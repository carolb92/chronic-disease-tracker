import useFHIRResources from "@/hooks/useFHIRResources";

export default function AppPage() {
	const {
		patient,
		observations,
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
			{Object.keys(ptError).length ? (
				<p>Error finding patient data</p>
			) : (
				<>
					<p>{displayName}</p>
					<p>{displayBDay ?? "No birth date available"}</p>
					<span>
						<span>{age}</span>
						<span>{gender?.[0].toUpperCase() ?? "No gender available"}</span>
					</span>
				</>
			)}

			{Object.keys(conditionsErr).length ? (
				<p>Error finding conditions data</p>
			) : (
				<div>{relevantConditions?.map((c) => c.code?.text).join(", ")}</div>
			)}

			{Object.keys(obsError).length ? (
				<p>Error finding observations data</p>
			) : (
				<div>observations go here</div>
			)}
		</div>
	);
}
