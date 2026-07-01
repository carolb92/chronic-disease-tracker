import useFHIRResources from "@/hooks/useFHIRResources";
import { Card, CardContent } from "@/components/ui/card";
import { User, CalendarDays } from "lucide-react";
import AppPageTabs from "@/components/AppPage/AppPageTabs";

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
		relevantSNOMEDCodes,
		groupedObservations,
		diabetesHedisMeasures,
	} = useFHIRResources();

	if (!patient)
		return (
			<div className="flex h-screen items-center justify-center text-muted-foreground">
				Loading patient data…
			</div>
		);

	const genderInitial = gender?.length ? gender[0].toUpperCase() : null;
	const relevantConditionsArr = relevantConditions.filter(
		(c) => c.code?.text || c.code?.coding?.some((coding) => coding.display),
	);

	return (
		<div className="m-8 md:mx-32 xl:mx-60 my-10 flex flex-col gap-y-5">
			{ptError ? (
				<Card>
					<CardContent className="py-6 text-center text-destructive">
						Unable to load patient data. Please try relaunching the app.
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardContent className="flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between">
						<div className="flex flex-col gap-1">
							<p className="text-lg font-semibold tracking-wide text-primary">
								{displayName ?? "Unknown Patient"}
							</p>
							<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
								{(age != null || genderInitial) && (
									<span className="inline-flex items-center gap-1.5">
										<User className="size-3.5 opacity-60" />
										{[age, genderInitial].filter(Boolean).join(" ")}
									</span>
								)}
								{displayBDay && (
									<span className="inline-flex items-center gap-1.5">
										<CalendarDays className="size-3.5 opacity-60" />
										{displayBDay}
									</span>
								)}
							</div>
						</div>

						{!conditionsErr &&
							relevantConditions &&
							relevantConditions.length > 0 && (
								<div className="flex flex-wrap gap-2 md:justify-end">
									{relevantConditionsArr.map((c) => (
										<span
											key={c.id}
											className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
										>
											{c.code?.text ??
												c.code?.coding?.find((coding) => coding.display)
													?.display}
										</span>
									))}
								</div>
							)}
					</CardContent>
				</Card>
			)}

			<AppPageTabs
					SNOMEDCodes={relevantSNOMEDCodes}
					groupedObservations={groupedObservations}
					diabetesHedisMeasures={diabetesHedisMeasures}
					gender={gender}
				/>

			{obsError && (
				<p className="text-sm text-destructive">
					Some observation data could not be loaded.
				</p>
			)}
		</div>
	);
}
