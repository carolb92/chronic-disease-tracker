import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Droplet, HeartPulse, Apple } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DM_SNOMED_CODES,
	HTN_SNOMED_CODES,
	HLD_SNOMED_CODES,
} from "@/lib/constants";
import { useState } from "react";

export default function AppPageTabs({
	SNOMEDCodes,
}: {
	SNOMEDCodes: string[];
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
	console.log("active tabs: ", activeTabs);

	const activeTab = defaultTab || activeTabs[0]?.value || "";

	return (
		<Tabs value={activeTab} onValueChange={setDefaultTab}>
			<TabsList variant="line" className="w-full justify-start">
				{activeTabs.map(({ value, icon: Icon, display }) => (
					<TabsTrigger value={value} className="gap-1.5" key={value}>
						<Icon className="text-primary size-4" />
						<span className="text-primary">{display}</span>
					</TabsTrigger>
				))}
			</TabsList>
			{activeTabs.map((tab) => (
				<TabsContent value={tab.value} key={tab.value}>
					<TabPlaceholder label={tab.display} />
				</TabsContent>
			))}
		</Tabs>
	);
}

function TabPlaceholder({ label }: { label: string }) {
	return (
		<div className="flex flex-col gap-4 pt-1">
			<div className="grid grid-cols-3 gap-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="rounded-lg bg-metric p-4">
						<div className="mb-2 h-3 w-16 rounded bg-muted-foreground/15" />
						<div className="h-6 w-12 rounded bg-muted-foreground/15" />
						<div className="mt-2 h-2.5 w-24 rounded bg-muted-foreground/10" />
					</div>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm text-muted-foreground">
						{label} — charts coming soon
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
						<span className="text-xs text-muted-foreground/60">Chart area</span>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
