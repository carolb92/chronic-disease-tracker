import InstructionsCard from "@/components/Instructions/InstructionsCard";
import InstructionsStepSection from "@/components/Instructions/InstructionsStepSection";
import PatientCard from "@/components/Instructions/PatientCard";
import CopyField from "@/components/global/CopyField";
import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight } from "lucide-react";
import FHIRVersionStep from "../assets/images/fhir-version-step.png";
import LaunchTypeStep from "../assets/images/launch-type-step.png";
import LaunchURLStep from "../assets/images/launch-url-step.png";
import MiscOptionsStep from "../assets/images/misc-options-step.png";
import PatientIDStep from "../assets/images/patient-id-step.png";

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

//TODO: replace url with vercel url once deployed
const launcherInstructions = [
	{
		title: "Select the launch type",
		description:
			'In the "Launch Type" select field, select the "Patient Portal Launch" option',
		content: <img src={LaunchTypeStep} alt="Launch type step screenshot" />,
	},
	{
		title: "Select the FHIR Version",
		description:
			'In the "FHIR Version" select field, make sure "R4" is selected',
		content: <img src={FHIRVersionStep} alt="FHIR version step screenshot" />,
	},
	{
		title: "Paste in the patient ID",
		description: 'Under "Patients", paste the ID you copied above',
		content: <img src={PatientIDStep} alt="Patient ID step screenshot" />,
	},
	{
		title: "Misc. Options",
		description:
			'In the Misc. Options section, make sure the "Skip login screen" and "Skip authorization screen" boxes are checked',
		content: <img src={MiscOptionsStep} alt="Misc. options step screenshot" />,
	},
	{
		title: "Paste in the app's launch URL",
		description:
			'Copy the URL below. Then, at the bottom of the screen in the "App\'s Launch URL" field, paste in the URL, and click the "Launch" button',
		content: (
			<div className="flex flex-col gap-y-2">
				<CopyField text="replacethis.url" />
				<img src={LaunchURLStep} alt="Launch URL step screenshot" />
			</div>
		),
	},
];

export default function Instructions() {
	return (
		<div className="m-8 md:mx-32 xl:mx-60 my-10 flex flex-col gap-y-5">
			<h1 className="text-lg font-semibold tracking-widest text-primary uppercase">
				Chronic Disease Tracker Demo Instructions
			</h1>
			<InstructionsCard title="How to Use this Demo">
				<p className="mb-2 text-muted-foreground">
					This is a demo of a{" "}
					<span className="font-semibold text-primary">
						SMART on FHIR patient portal app
					</span>
					. To try it, you'll launch it through a public SMART sandbox launcher
					using a synthetic patient record.{" "}
					<span className="font-semibold text-primary">
						No real patient data is used
					</span>
					. For the best experience, use one of the patient records below.
				</p>
				<p className="text-muted-foreground">
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
			<InstructionsStepSection sectionTitle="switching patients later">
				<div className="flex flex-col gap-y-3">
					<p className="text-muted-foreground">
						Once inside the app, use the{" "}
						<span className="font-semibold text-primary">
							"How to use this demo"
						</span>{" "}
						link in the footer to return to this page and relaunch with a
						different patient ID.
					</p>
					<p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-muted-foreground">
						<span className="font-semibold text-primary">About this demo:</span>{" "}
						All patient data is synthetic, generated via Synthea for
						demonstration purposes. No real patient information is used or
						stored.
					</p>
				</div>
			</InstructionsStepSection>
		</div>
	);
}
