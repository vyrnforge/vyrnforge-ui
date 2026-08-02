const consumerBatchProgression = Object.freeze([
  "CF-7001-CF-7002-CF-7008",
  "CF-7003",
  "CF-7004",
  "CF-7005",
  "CF-7006-CF-7007",
  "CF-7009-CF-7011-CF-7012",
  "CF-7010-CF-7013",
]);

const consumerBatchIndexes = new Map(
  consumerBatchProgression.map((batch, index) => [batch, index]),
);

export const currentConsumerBatch = consumerBatchProgression.at(-1);

export function isKnownConsumerBatch(batch) {
  return consumerBatchIndexes.has(batch);
}

export function isConsumerBatchAtLeast(batch, minimumBatch) {
  const batchIndex = consumerBatchIndexes.get(batch);
  const minimumIndex = consumerBatchIndexes.get(minimumBatch);

  return (
    batchIndex !== undefined &&
    minimumIndex !== undefined &&
    batchIndex >= minimumIndex
  );
}
