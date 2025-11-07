import { demoOrchestrator } from "@resume-copilot/orchestrator";

async function main() {
  const latest = demoOrchestrator.latest("demo-journey-001");
  console.log("Current workflow step", latest?.step ?? "unknown");
}

main();
