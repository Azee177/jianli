export type WorkflowStep =
  | "UPLOAD"
  | "PARSE_OK"
  | "TARGET_CONFIRMED"
  | "JD_FETCHED"
  | "COMMON_DIMS_LOCKED"
  | "DRAFT_V1"
  | "REWRITE_LOOP"
  | "COMPANY_QUARTER_DONE"
  | "PREP_READY"
  | "INTERVIEW_READY"
  | "EXPORTABLE"
  | "SUBMISSION_TRACKING";

export interface WorkflowEvent {
  journeyId: string;
  step: WorkflowStep;
  timestamp: string;
  payload?: Record<string, unknown>;
}

/**
 * WorkflowOrchestrator is a lightweight placeholder for the Temporal
 * implementation described in the architecture document. It records
 * journey events in-memory so downstream services can subscribe during
 * early development without Temporal running locally.
 */
export class WorkflowOrchestrator {
  private events: WorkflowEvent[] = [];

  record(event: WorkflowEvent) {
    this.events.push(event);
  }

  latest(journeyId: string): WorkflowEvent | undefined {
    const journeyEvents = this.events.filter(
      (event) => event.journeyId === journeyId,
    );
    return journeyEvents.at(-1);
  }

  history(journeyId: string): WorkflowEvent[] {
    return this.events
      .filter((event) => event.journeyId === journeyId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
}

export const demoOrchestrator = (() => {
  const orchestrator = new WorkflowOrchestrator();
  orchestrator.record({
    journeyId: "demo-journey-001",
    step: "COMMON_DIMS_LOCKED",
    timestamp: new Date().toISOString(),
    payload: {
      commonDimensions: [
        "指标闭环",
        "跨团队协作",
        "ToB 行业洞察",
        "风险防控",
      ],
    },
  });
  return orchestrator;
})();

