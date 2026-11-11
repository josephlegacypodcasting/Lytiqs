// Calculator model: screens, parsing, validation and result arithmetic.

export const AREAS = ["turnover", "acquisition", "mobility"] as const;
export type Area = (typeof AREAS)[number];

/** Number of real (non "None of the above") options per visibility question. */
const AREA_TOTALS: Record<Area, number> = { turnover: 5, acquisition: 6, mobility: 6 };

export const NONE = "none";
export const UNSURE = "unsure";
export const ASSUMED_REPLACEMENT_PCT = 50;

export type Level = "HIGH" | "MODERATE" | "LIMITED";

export interface Inputs {
  employees: number;
  avgSalary: number;
  voluntaryTurnoverPct: number;
  annualHires: number;
  replacementCostPct: number | null;
  firstYearTurnoverPct: number | null;
  costPerHire: number | null;
  internalHirePct: number | null;
  visibility: Record<Area, string[]>;
}

export interface Scenario {
  id: string;
  label: string;
  movement: string;
  amount: number;
  assumed: boolean;
}

export interface Opportunity {
  area: Area;
  level: Level;
  unseen: number;
  total: number;
}

export interface Result {
  replacementCostPct: number;
  replacementCostAssumed: boolean;
  costPerDeparture: number;
  voluntaryTurnoverCost: number;
  earlyTenure: {
    departures: number;
    replacementCost: number;
    recruitingSpend: number | null;
  } | null;
  scenarios: Scenario[];
  opportunities: Opportunity[];
}

function points(n: number) {
  const v = Number(n.toFixed(2));
  return `${v.toLocaleString("en-US")} percentage point${v === 1 ? "" : "s"}`;
}

export function calculate(inputs: Inputs): Result {
  const {
    employees,
    avgSalary,
    voluntaryTurnoverPct,
    annualHires,
    firstYearTurnoverPct,
    costPerHire,
  } = inputs;
  const replacementCostAssumed = inputs.replacementCostPct === null;
  const replacementCostPct = inputs.replacementCostPct ?? ASSUMED_REPLACEMENT_PCT;
  const costPerDeparture = (replacementCostPct / 100) * avgSalary;

  const earlyTenure =
    firstYearTurnoverPct === null || annualHires <= 0
      ? null
      : {
          departures: Math.round((firstYearTurnoverPct / 100) * annualHires),
          replacementCost: (firstYearTurnoverPct / 100) * annualHires * costPerDeparture,
          recruitingSpend:
            costPerHire === null
              ? null
              : (firstYearTurnoverPct / 100) * annualHires * costPerHire,
        };

  const scenarios: Scenario[] = [];

  const volCut = Math.min(1, voluntaryTurnoverPct);
  if (volCut > 0) {
    const fewer = (volCut / 100) * employees;
    scenarios.push({
      id: "voluntary",
      label: `Reducing overall voluntary turnover by ${points(volCut)}`,
      movement: `${Math.round(fewer).toLocaleString("en-US")} fewer departures a year`,
      amount: fewer * costPerDeparture,
      assumed: replacementCostAssumed,
    });
  }

  if (earlyTenure && firstYearTurnoverPct !== null) {
    const cut = Math.min(3, firstYearTurnoverPct);
    if (cut > 0) {
      const fewer = (cut / 100) * annualHires;
      scenarios.push({
        id: "firstYear",
        label: `Reducing first-year turnover by ${points(cut)}`,
        movement: `${Math.round(fewer).toLocaleString("en-US")} fewer early-tenure departures a year`,
        amount: fewer * costPerDeparture + (costPerHire === null ? 0 : fewer * costPerHire),
        assumed: replacementCostAssumed,
      });
    }
  }

  const opportunities: Opportunity[] = AREAS.map((area) => {
    const total = AREA_TOTALS[area];
    const unseen = total - (inputs.visibility[area] ?? []).filter((id) => id !== NONE).length;
    const ratio = unseen / total;
    return {
      area,
      level: ratio >= 0.6 ? "HIGH" : ratio >= 0.25 ? "MODERATE" : "LIMITED",
      unseen,
      total,
    };
  });

  return {
    replacementCostPct,
    replacementCostAssumed,
    costPerDeparture,
    voluntaryTurnoverCost: (voluntaryTurnoverPct / 100) * employees * costPerDeparture,
    earlyTenure,
    scenarios: scenarios.filter((s) => s.amount > 0),
    opportunities,
  };
}

export const LIMITS = {
  employees: { min: 1, max: 5_000_000 },
  avgSalary: { min: 1_000, max: 10_000_000 },
  voluntaryTurnoverPct: { min: 0, max: 100 },
  annualHires: { min: 0, max: 1_000_000 },
  firstYearTurnoverPct: { min: 0, max: 100 },
  costPerHire: { min: 0, max: 1_000_000 },
  internalHirePct: { min: 0, max: 100 },
} as const;

export const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function moneyShort(n: number) {
  if (n >= 1e6) {
    const m = n / 1e6;
    return `$${Number(m.toFixed(m < 10 ? 1 : 0)).toLocaleString("en-US")}M`;
  }
  return n >= 1e3
    ? `$${Math.round(n / 1e3).toLocaleString("en-US")}K`
    : `$${Math.round(n).toLocaleString("en-US")}`;
}

export const count = (n: number) => Math.round(n).toLocaleString("en-US");
export const grouped = (n: number) => n.toLocaleString("en-US");

// ---------------------------------------------------------------------------
// Screens

export type NumberKey =
  | "employees"
  | "avgSalary"
  | "voluntaryTurnoverPct"
  | "annualHires"
  | "firstYearTurnoverPct"
  | "costPerHire"
  | "internalHirePct";

export interface NumberField {
  kind: "number";
  key: NumberKey;
  label: string;
  help?: string;
  unit: "" | "$" | "%";
  placeholder: string;
  grouped: boolean;
  allowUnsure: boolean;
}

export interface ChoiceField {
  kind: "choice";
  key: "replacementCostPct";
  label: string;
  help?: string;
  options: { value: string; label: string }[];
}

export interface MultiField {
  kind: "multi";
  key: Area;
  label: string;
  hint?: string;
  options: { id: string; label: string }[];
}

export type Field = NumberField | ChoiceField | MultiField;

export interface Screen {
  id: string;
  name: string;
  heading: string;
  lede: string;
  fields: Field[];
}

export const SCREENS: Screen[] = [
  {
    id: "workforce",
    name: "Your Workforce",
    heading: "Start with the basics.",
    lede: "Tell us a little about your workforce so we can put your results into context.",
    fields: [
      { kind: "number", key: "employees", label: "Number of employees", unit: "", placeholder: "2,500", grouped: true, allowUnsure: false },
      { kind: "number", key: "avgSalary", label: "Average annual salary", unit: "$", placeholder: "65,000", grouped: true, allowUnsure: false },
      { kind: "number", key: "voluntaryTurnoverPct", label: "Annual voluntary turnover rate", unit: "%", placeholder: "15", grouped: false, allowUnsure: false },
      { kind: "number", key: "annualHires", label: "Number of hires in the last 12 months", unit: "", placeholder: "500", grouped: true, allowUnsure: false },
    ],
  },
  {
    id: "turnover",
    name: "Turnover & Retention",
    heading: "How much do you really know about who is leaving?",
    lede: "Knowing your turnover rate is one thing. Understanding where turnover is happening and what it is costing you is another.",
    fields: [
      {
        kind: "multi",
        key: "turnover",
        label: "Which of these can you easily answer today?",
        hint: "Select all that apply.",
        options: [
          { id: "department", label: "Which departments or teams have the highest turnover" },
          { id: "role", label: "Which roles have the highest turnover" },
          { id: "newHires", label: "Whether new hires are staying" },
          { id: "tenure", label: "How turnover differs by tenure" },
          { id: "trend", label: "How turnover trends are changing over time" },
          { id: NONE, label: "None of the above" },
        ],
      },
      {
        kind: "choice",
        key: "replacementCostPct",
        label: "What do you estimate it costs to replace an employee?",
        options: [
          { value: "25", label: "25% of annual salary" },
          { value: "50", label: "50% of annual salary" },
          { value: "75", label: "75% of annual salary" },
          { value: "100", label: "100% of annual salary" },
          { value: UNSURE, label: "Not sure" },
        ],
      },
    ],
  },
  {
    id: "acquisition",
    name: "Talent Acquisition",
    heading: "What happens after the hire?",
    lede: "Most organizations can measure recruiting activity. The bigger question is whether they can see which hiring decisions are producing employees who stay.",
    fields: [
      { kind: "number", key: "firstYearTurnoverPct", label: "Approximately what percentage of new hires leave within their first year?", unit: "%", placeholder: "18", grouped: false, allowUnsure: true },
      { kind: "number", key: "costPerHire", label: "What is your average cost per hire?", unit: "$", placeholder: "5,000", grouped: true, allowUnsure: true },
      {
        kind: "multi",
        key: "acquisition",
        label: "Which of the following recruiting metrics and insights can you currently track and analyze?",
        hint: "Select all that apply.",
        options: [
          { id: "sourceVolume", label: "Which recruiting sources generate the most hires" },
          { id: "sourceQuality", label: "Which sources produce employees who stay" },
          { id: "timeToFill", label: "Time to fill by role or department" },
          { id: "costPerHire", label: "Cost per hire" },
          { id: "newHireTurnover", label: "New hire turnover" },
          { id: "segmented", label: "How hiring outcomes differ across roles, locations or departments" },
          { id: NONE, label: "None of the above" },
        ],
      },
    ],
  },
  {
    id: "mobility",
    name: "Internal Mobility",
    heading: "How well can you see talent moving inside your organization?",
    lede: "Internal movement can reveal whether your organization is developing and retaining talent or relying primarily on external hiring.",
    fields: [
      {
        kind: "multi",
        key: "mobility",
        label: "Which of these can you easily answer today?",
        hint: "Select all that apply.",
        options: [
          { id: "internalRate", label: "Internal hire rate" },
          { id: "promotion", label: "Promotion rate" },
          { id: "lateral", label: "Lateral movement rate" },
          { id: "fromTo", label: "Where employees are moving from and to" },
          { id: "sourceTeams", label: "Which departments or roles generate the most internal talent" },
          { id: "vsExternal", label: "How internal hires compare with external hires" },
          { id: NONE, label: "None of the above" },
        ],
      },
      { kind: "number", key: "internalHirePct", label: "Approximately what percentage of your hires come from inside the organization?", unit: "%", placeholder: "20", grouped: false, allowUnsure: true },
    ],
  },
];

export interface Draft {
  employees: string;
  avgSalary: string;
  voluntaryTurnoverPct: string;
  annualHires: string;
  replacementCostPct: string;
  firstYearTurnoverPct: string;
  costPerHire: string;
  internalHirePct: string;
  turnover: string[];
  acquisition: string[];
  mobility: string[];
}

export const EMPTY_DRAFT: Draft = {
  employees: "",
  avgSalary: "",
  voluntaryTurnoverPct: "",
  annualHires: "",
  replacementCostPct: "",
  firstYearTurnoverPct: "",
  costPerHire: "",
  internalHirePct: "",
  turnover: [],
  acquisition: [],
  mobility: [],
};

export function parseNumber(raw: string): number | null {
  if (raw === UNSURE) return null;
  const n = Number(raw.replace(/,/g, ""));
  return raw.trim() !== "" && Number.isFinite(n) ? n : null;
}

/** Keeps digits (and up to two decimals for ungrouped fields); groups thousands. */
export function formatTyped(raw: string, field: NumberField) {
  const [whole = "", ...rest] = raw.replace(/[^\d.]/g, "").split(".");
  const decimals = field.grouped ? "" : rest.length ? `.${rest.join("").slice(0, 2)}` : "";
  const head = field.grouped ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : whole;
  return `${head}${decimals}`;
}

export function toggleMulti(current: string[], id: string) {
  if (id === NONE) return current.includes(NONE) ? [] : [NONE];
  const rest = current.filter((x) => x !== NONE);
  return rest.includes(id) ? rest.filter((x) => x !== id) : [...rest, id];
}

export function formatWithUnit(n: number, unit: NumberField["unit"]) {
  return unit === "$" ? `$${grouped(n)}` : unit === "%" ? `${n}%` : grouped(n);
}

export interface FieldError {
  key: string;
  message: string;
}

export function validateScreen(screen: Screen, draft: Draft): FieldError | null {
  for (const f of screen.fields) {
    if (f.kind === "number") {
      const raw = draft[f.key];
      if (raw === UNSURE) continue;
      const n = parseNumber(raw);
      if (n === null)
        return {
          key: f.key,
          message: f.allowUnsure
            ? "Please enter a figure, or select I'm not sure."
            : "Please enter a figure to continue.",
        };
      const { min, max } = LIMITS[f.key];
      if (n < min || n > max)
        return {
          key: f.key,
          message: `Please enter a figure between ${formatWithUnit(min, f.unit)} and ${formatWithUnit(max, f.unit)}.`,
        };
    } else if (f.kind === "choice") {
      if (!draft[f.key])
        return { key: f.key, message: "Please select an option to continue." };
    } else if (draft[f.key].length === 0) {
      return {
        key: f.key,
        message: "Please select at least one option, or None of the above.",
      };
    }
  }
  return null;
}

/** Short summary of a completed step, for the side rail. */
export function stepSummary(screen: Screen, draft: Draft) {
  const num = screen.fields.find((f): f is NumberField => f.kind === "number");
  if (num) {
    const raw = draft[num.key];
    if (raw === UNSURE) return "Not sure";
    const n = parseNumber(raw);
    return n === null ? "" : formatWithUnit(n, num.unit);
  }
  const multi = screen.fields.find((f): f is MultiField => f.kind === "multi");
  if (!multi || draft[multi.key].length === 0) return "";
  const seen = draft[multi.key].filter((x) => x !== NONE).length;
  return `${seen} of ${multi.options.length - 1} visible`;
}

export function toInputs(d: Draft): Inputs {
  return {
    employees: parseNumber(d.employees) ?? 0,
    avgSalary: parseNumber(d.avgSalary) ?? 0,
    voluntaryTurnoverPct: parseNumber(d.voluntaryTurnoverPct) ?? 0,
    annualHires: parseNumber(d.annualHires) ?? 0,
    replacementCostPct: parseNumber(d.replacementCostPct),
    firstYearTurnoverPct: parseNumber(d.firstYearTurnoverPct),
    costPerHire: parseNumber(d.costPerHire),
    internalHirePct: parseNumber(d.internalHirePct),
    visibility: { turnover: d.turnover, acquisition: d.acquisition, mobility: d.mobility },
  };
}

/** Flattened answers sent with the lead, matching the original payload. */
export function leadAnswers(inputs: Inputs, draft: Draft) {
  const r = calculate(inputs);
  const multiFields = SCREENS.flatMap((s) => s.fields).filter(
    (f): f is MultiField => f.kind === "multi",
  );
  return {
    employees: String(inputs.employees),
    avgSalary: String(inputs.avgSalary),
    voluntaryTurnoverPct: String(inputs.voluntaryTurnoverPct),
    annualHires: String(inputs.annualHires),
    replacementCostPct: draft.replacementCostPct,
    firstYearTurnoverPct: draft.firstYearTurnoverPct || UNSURE,
    costPerHire: draft.costPerHire || UNSURE,
    internalHirePct: draft.internalHirePct || UNSURE,
    ...Object.fromEntries(
      AREAS.map((area) => {
        const field = multiFields.find((f) => f.key === area);
        const labels = field
          ? draft[area]
              .map((id) => field.options.find((o) => o.id === id)?.label)
              .filter((l): l is string => !!l)
          : [];
        return [`${area}Visible`, labels.join(", ")];
      }),
    ),
    ...Object.fromEntries(
      r.opportunities.map((o) => [
        `${o.area}Opportunity`,
        `${o.level} (${o.unseen} of ${o.total} unseen)`,
      ]),
    ),
    voluntaryTurnoverCost: String(Math.round(r.voluntaryTurnoverCost)),
    firstYearReplacementCost: r.earlyTenure
      ? String(Math.round(r.earlyTenure.replacementCost))
      : "not calculated",
    recruitingSpendLost:
      r.earlyTenure?.recruitingSpend != null
        ? String(Math.round(r.earlyTenure.recruitingSpend))
        : "not calculated",
  };
}
