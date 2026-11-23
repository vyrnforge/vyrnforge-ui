/**
 * Run-history sweeps refresh GitHub's run listing between bounded deletion batches.
 * Planning stays in retention.mjs; network access stays in retention-cleanup.mjs.
 */
export async function sweepRunHistory({
  listRuns,
  plan,
  deleteRun,
  dryRun = false,
  maxBatches = 4,
  wait = (milliseconds) => new Promise((resolve) => { setTimeout(resolve, milliseconds); }),
  delayMs = 400
}) {
  if (!Number.isInteger(maxBatches) || maxBatches < 1) throw new Error('maxBatches must be positive');
  if (!Number.isInteger(delayMs) || delayMs < 0) throw new Error('delayMs must be non-negative');

  const batches = [];
  const results = [];
  let remainingCandidates = null;
  let remainingAgeExpired = null;
  let initialCandidates = null;
  let stoppedForFailure = false;
  let lastPlan = null;

  for (let index = 0; index < maxBatches; index += 1) {
    const runs = await listRuns();
    const currentPlan = plan(runs);
    if (initialCandidates === null) initialCandidates = currentPlan.candidateCount;
    lastPlan = currentPlan;
    const batch = {
      number: index + 1,
      candidateCount: currentPlan.candidateCount,
      deletionCap: currentPlan.deletionCap,
      plannedDeletions: currentPlan.deletions.length,
      results: []
    };

    if (currentPlan.deletions.length === 0 || dryRun) {
      remainingCandidates = currentPlan.candidateCount;
      remainingAgeExpired = currentPlan.ageBased?.candidateCount ?? currentPlan.candidateCount;
      batches.push(batch);
      break;
    }

    for (const deletion of currentPlan.deletions) {
      let result;
      try {
        result = await deleteRun(deletion.id);
      } catch (error) {
        result = { id: deletion.id, status: 'failed', error: error instanceof Error ? error.message : String(error) };
      }
      batch.results.push(result);
      results.push(result);
      if (result.status === 'failed') {
        stoppedForFailure = true;
        break;
      }
      await wait(delayMs);
    }
    batches.push(batch);
    if (stoppedForFailure) break;
  }

  if (!dryRun && remainingCandidates === null) {
    // A fresh list is authoritative; planning deletions is not proof of deletion.
    lastPlan = plan(await listRuns());
    remainingCandidates = lastPlan.candidateCount;
    remainingAgeExpired = lastPlan.ageBased?.candidateCount ?? lastPlan.candidateCount;
  }

  return {
    initialCandidates,
    remainingCandidates,
    remainingAgeExpired,
    incomplete: !dryRun && (stoppedForFailure || remainingCandidates > 0),
    stoppedForFailure,
    batches,
    results,
    finalPlan: { candidateCount: lastPlan?.candidateCount ?? 0, deferredByCap: lastPlan?.deferredByCap ?? 0 },
    deletedRuns: results.filter((result) => result.status === 'deleted').length,
    alreadyAbsentRuns: results.filter((result) => result.status === 'already-absent').length,
    failedRuns: results.filter((result) => result.status === 'failed').length
  };
}
