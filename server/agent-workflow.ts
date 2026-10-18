import { randomUUID } from 'node:crypto'
import { inngest } from './inngest'
import {
  agentState,
  getRun,
  goalSatisfied,
  recordDecision,
  recordToolAction,
  setIteration,
  setRun,
} from './agent-data'
import {
  chooseAction,
  writeReport,
} from './agent-brain'
import { checkoutServiceUrl } from './observe'

// The alert intake has already opened an incident. Build its harness here.
export const incidentAgent = inngest.createFunction(
  { id: 'incident-agent', name: 'Checkout incident agent', triggers: { event: 'incident/opened' } },
  async ({ event, step }) => {
    const { environmentId, runId } = event.data
    await setRun(event.data.runId, 'escalated', 'Harness not implemented yet')
    
    return step.run('whole-agentLoop', async () => {
      const run = await getRun(runId)

      for (let cycle = 1; cycle <= 8; cycle++) {
        const state = await agentState(environmentId, runId)

        if (goalSatisfied(state, run.goalCondition)) {
          const report = await writeReport(run.goal, state)
          await setRun(runId, 'completed', null, report)
          return { report }
        }
      }
    })
  },
)
