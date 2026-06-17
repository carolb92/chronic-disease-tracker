import InstructionsCard from "@/components/Instructions/InstructionsCard";
import InstructionsStepSection from "@/components/Instructions/InstructionsStepSection";
import PatientCard from "@/components/Instructions/PatientCard";
import CopyField from "@/components/global/CopyField";
import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight } from "lucide-react";

type Patients = {
	ptName: string;
	description: string;
	id: string;
};

const patients: Patients[] = [
	{
		ptName: "Conn, Almeda",
		description: "58F | Diabetes, Hypertension",
		id: "5f6d256f-fc32-4b10-ba9c-51aba830cfa4",
	},
	{
		ptName: "Trevino, Eduardo",
		description: "55M | Hyperlipidemia",
		id: "b89834ac-a767-4563-890b-cac9d55adb15",
	},
];

//TODO: replace null imgs with screenshots, replace url with vercel url once deployed
const launcherInstructions = [
	{
		title: "Select the launch type",
		description:
			'In the "Launch Type" select field, select the "Patient Portal Launch" option',
		content: null,
	},
	{
		title: "Select the FHIR Version",
		description:
			'In the "FHIR Version" select field, make sure "R4" is selected',
		content: null,
	},
	{
		title: "Misc. Options",
		description:
			'In the Misc. Options section, make sure the "Skip login screen" and "Skip authorization screen" boxes are checked',
		content: null,
	},
	{
		title: "Paste in the patient ID",
		description: 'Under "Patients", paste the ID you copied above',
		content: null,
	},
	{
		title: "Paste in the app's launch URL",
		description:
			"At the bottom of the screen, in the \"App's Launch URL\" field, paste in this app's launch URL",
		content: <CopyField text="replacethis.url" />,
	},
];

export default function Instructions() {
	return (
		<div className="m-8 md:mx-32 xl:mx-60 my-10 flex flex-col gap-y-4">
			<h1>Chronic Disease Tracker Demo Instructions</h1>
			<InstructionsCard title="How to Use this Demo">
				<p className="mb-2">
					This is a demo of a{" "}
					<span className="font-bold">SMART on FHIR patient portal app</span>.
					To try it, you'll launch it through a public SMART sandbox launcher
					using a synthetic patient record.{" "}
					<span className="font-bold">No real patient data is used</span>. For
					the best experience, use one of the patient records below.
				</p>
				<p>
					Follow the steps in order; the screenshots show exactly what to select
					and where to paste each value.
				</p>
			</InstructionsCard>
			<InstructionsStepSection
				stepNumber="1"
				sectionTitle="choose a patient"
				mdFlexDirection="md:flex-row"
			>
				{patients.map(({ ptName, description, id }) => (
					<PatientCard
						ptName={ptName}
						description={description}
						ptID={id}
						key={id}
					/>
				))}
			</InstructionsStepSection>
			<InstructionsStepSection
				stepNumber="2"
				sectionTitle="open the smart launcher"
			>
				<InstructionsCard
					title="SMART App Launcher"
					description="Opens in a new tab –– keep this page open for reference"
					action={
						<Button>
							<a
								href="https://launch.smarthealthit.org/"
								target="_blank"
								rel="noreferrer noopener"
							>
								Launch
							</a>
							<SquareArrowOutUpRight />
						</Button>
					}
				/>
				{launcherInstructions.map(({ title, description, content }, i) => (
					<InstructionsCard
						key={title}
						stepNumber={i + 1}
						title={title}
						description={description}
					>
						{content}
					</InstructionsCard>
				))}
			</InstructionsStepSection>
		</div>
	);
}
