import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Droplet, HeartPulse, Apple } from "lucide-react";
import {
	DM_SNOMED_CODES,
	HTN_SNOMED_CODES,
	HLD_SNOMED_CODES,
} from "@/lib/constants";
import { useState } from "react";
import type { TransformedObservation } from "@/lib/clinical/observations";
import type { DiabetesCareGuidelineResult } from "@/lib/diabetesCareGuidelines";
import DiabetesTabContent from "./DiabetesTabContent";
import HypertensionTabContent from "./HypertensionTabContent";
import CholesterolTabContent from "./CholesterolTabContent";

export default function AppPageTabs({
	SNOMEDCodes,
	groupedObservations,
	diabetesCareGuidelines,
	gender,
}: {
	SNOMEDCodes: string[];
	groupedObservations: Record<string, TransformedObservation[]>;
	diabetesCareGuidelines: DiabetesCareGuidelineResult[] | null;
	gender: string | null | undefined;
}) {
	const [defaultTab, setDefaultTab] = useState("");

	const TAB_CONFIG = [
		{
			display: "Diabetes",
			icon: Droplet,
			snomedCodes: DM_SNOMED_CODES,
			value: "diabetes",
		},
		{
			display: "Blood Pressure",
			icon: HeartPulse,
			snomedCodes: HTN_SNOMED_CODES,
			value: "hypertension",
		},
		{
			display: "Cholesterol",
			icon: Apple,
			snomedCodes: HLD_SNOMED_CODES,
			value: "hyperlipidemia",
		},
	];

	const activeTabs = TAB_CONFIG.filter((tab) =>
		tab.snomedCodes.some((code) => SNOMEDCodes.includes(code)),
	);

	const activeTab = defaultTab || activeTabs[0]?.value || "";

	return (
		<Tabs value={activeTab} onValueChange={setDefaultTab}>
			<TabsList variant="line" className="w-full justify-start">
				{activeTabs.map(({ value, icon: Icon, display }) => (
					<TabsTrigger
						value={value}
						className="gap-1.5 after:bg-primary"
						key={value}
					>
						<Icon className="text-primary size-4" />
						<span className="text-primary">{display}</span>
					</TabsTrigger>
				))}
			</TabsList>
			{activeTabs.map((tab) => (
				<TabsContent value={tab.value} key={tab.value}>
					{tab.value === "diabetes" && (
						<DiabetesTabContent
							groupedObservations={groupedObservations}
							diabetesCareGuidelines={diabetesCareGuidelines}
						/>
					)}
					{tab.value === "hypertension" && (
						<HypertensionTabContent groupedObservations={groupedObservations} />
					)}
					{tab.value === "hyperlipidemia" && (
						<CholesterolTabContent groupedObservations={groupedObservations} gender={gender} />
					)}
				</TabsContent>
			))}
		</Tabs>
	);
}
