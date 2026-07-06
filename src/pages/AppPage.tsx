import useFHIRResources from "@/hooks/useFHIRResources";
import { Card, CardContent } from "@/components/ui/card";
import { User, CalendarDays, Activity, SquareArrowOutUpRight } from "lucide-react";
import AppPageTabs from "@/components/AppPage/AppPageTabs";
import { Link } from "react-router";

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

	const genderInitial = gender?.length ? gender[0].toUpperCase() : null;
	const relevantConditionsArr = (relevantConditions ?? []).filter(
		(c) => c.code?.text || c.code?.coding?.some((coding) => coding.display),
	);

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<header className="sticky top-0 z-20 bg-primary">
				<div className="flex h-14 items-center justify-between px-6">
					<div className="flex items-center gap-2">
						<Activity className="size-4 text-primary-foreground" strokeWidth={2.25} />
						<span className="text-sm">
							<span className="font-semibold text-primary-foreground tracking-tight">
								MyHealth
							</span>
							<span className="font-medium text-primary-foreground/70"> Trends</span>
						</span>
					</div>
					{displayName && (
						<div className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
							<User className="size-3.5 opacity-60" />
							<span>{displayName}</span>
						</div>
					)}
				</div>
			</header>

			{ptError ? (
				<div className="flex h-[calc(100vh-3.5rem)] items-center justify-center px-6">
					<Card className="w-full max-w-md">
						<CardContent className="py-6 text-center text-destructive">
							Unable to load patient data. Please try relaunching the app.
						</CardContent>
					</Card>
				</div>
			) : !patient ? (
				<div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-muted-foreground">
					Loading patient data…
				</div>
			) : (
				<div className="m-8 md:mx-32 xl:mx-60 my-10 flex flex-col gap-y-5">
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
			)}

			<footer className="mt-auto bg-primary px-6 py-3 flex items-center justify-center sm:justify-between gap-6">
				<p className="hidden sm:block text-xs text-primary-foreground/60 tracking-wide">
					Synthetic data only · Not for clinical use
				</p>
				<div className="flex items-center gap-5 text-sm text-primary-foreground/80">
					<Link
						to="/instructions"
						className="hover:text-primary-foreground transition-colors"
					>
						How to use this demo
					</Link>
					<span aria-hidden="true" className="text-primary-foreground/30 select-none">|</span>
					<a
						href="https://launch.smarthealthit.org/"
						target="_blank"
						rel="noreferrer noopener"
						className="inline-flex items-center gap-1.5 hover:text-primary-foreground transition-colors"
					>
						SMART App Launcher
						<SquareArrowOutUpRight className="size-3.5" />
					</a>
				</div>
			</footer>
		</div>
	);
}
