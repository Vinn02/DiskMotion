// Contoh fungsi algoritma First-Come, First-Served (FCFS)
export function calculateFCFS(initialHead, requests) {
  let currentHead = initialHead;
  let totalSeek = 0;
  const sequence = [initialHead];

  for (let i = 0; i < requests.length; i++) {
    const distance = Math.abs(requests[i] - currentHead);
    totalSeek += distance;
    currentHead = requests[i];
    sequence.push(currentHead);
  }

  return { sequence, totalSeek };
}
