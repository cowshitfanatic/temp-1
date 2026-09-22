export type Intake = {
  submissionId: string;
  workEmail: string;
  companyName: string;
  companyUrl: string;
  category: string;
  competitors: string[];
  buyerQuestions: string[];
};

export type IntakeValidationResult =
  | { ok: true; value: Intake }
  | { ok: false; fields: string[] };

export function validateIntake(body: unknown): IntakeValidationResult;
