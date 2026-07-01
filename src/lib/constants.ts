export const TRACKED_CONDITION_SNOMED_CODES = [
	"46635009", //T1DM
	"44054006", //T2DM
	"38341003", // general HTN (hypertensive disorder)
	"59621000", // essential HTN
	"55822004", // general hyperlipidemia
	"13644009", // hypercholesterolemia (disorder)
	"398036000", // familial hypercholesterolemia
	"238079002", // Familial hypercholesterolemia - heterozygous
	"238078005", // Familial hypercholesterolemia - homozygous
	"403829002", // Familial hypercholesterolemia due to heterozygous low density lipoprotein receptor mutation
	"403831006", // Familial hypercholesterolemia due to genetic defect of apolipoprotein B
];

export const DM_SNOMED_CODES = [
	"46635009", //T1DM
	"44054006", //T2DM
];

export const HTN_SNOMED_CODES = [
	"38341003", // general HTN (hypertensive disorder)
	"59621000", // essential HTN
];

export const HLD_SNOMED_CODES = [
	"55822004", // general hyperlipidemia
	"13644009", // hypercholesterolemia (disorder)
	"398036000", // familial hypercholesterolemia
	"238079002", // Familial hypercholesterolemia - heterozygous
	"238078005", // Familial hypercholesterolemia - homozygous
	"403829002", // Familial hypercholesterolemia due to heterozygous low density lipoprotein receptor mutation
	"403831006", // Familial hypercholesterolemia due to genetic defect of apolipoprotein B
];

export const DIABETES_LOINC_CODES = [
	"1558-6", // Fasting glucose
	"4548-4", // Hemoglobin A1c
	"29463-7", // Body weight
	"33914-3", // eGFR
	"14959-1", // uACR (Microalbumin Creatinine Ratio)
	"55284-4", // Blood pressure panel
];

export const HTN_LOINC_CODES = [
	"8480-6", // systolic BP
	"8462-4", // diastolic BP
	"55284-4", // Blood pressure panel
	"8478-0", // mean BP
];

export const HLD_LOINC_CODES = [
	"2089-1", // LDL
	"2093-3", // total cholesterol
	"2085-9", // HDL
	"2571-8", // triglycerides
	"47210-0", // serum/plasma triglycerides fasting
	"3043-7", // whole blood triglycerides
	"18262-6", // low density lipoprotein cholesterol
	"43396-1", // non-HDL cholesterol
];

export const SNOMED_TO_LOINC: Record<string, string[]> = {
	"46635009": DIABETES_LOINC_CODES, // T1DM
	"44054006": DIABETES_LOINC_CODES, // T2DM
	"38341003": HTN_LOINC_CODES, // general HTN
	"59621000": HTN_LOINC_CODES, // essential HTN
	"55822004": HLD_LOINC_CODES, // general hyperlipidemia
	"13644009": HLD_LOINC_CODES, // hypercholesterolemia
	"398036000": HLD_LOINC_CODES, // familial hypercholesterolemia
	"238079002": HLD_LOINC_CODES, // familial hypercholesterolemia - heterozygous
	"238078005": HLD_LOINC_CODES, // familial hypercholesterolemia - homozygous
	"403829002": HLD_LOINC_CODES, // familial hypercholesterolemia - LDL receptor mutation
	"403831006": HLD_LOINC_CODES, // familial hypercholesterolemia - apolipoprotein B defect
};
