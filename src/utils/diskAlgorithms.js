/**
 * Deskripsi dan karakteristik tiap algoritma Disk Scheduling
 */
export const ALGORITHM_DESCRIPTIONS = {
  FCFS: {
    title: "FCFS - First-Come, First-Served",
    description:
      "FCFS melayani permintaan persis sesuai urutan kedatangan. Head bergerak tanpa mempertimbangkan jarak.",
    characteristic:
      "Karakteristik: Sederhana dan adil, tetapi gerakan head bisa sangat boros.",
  },
  SSTF: {
    title: "SSTF - Shortest Seek Time First",
    description:
      "SSTF memilih permintaan dengan jarak terdekat dari posisi head saat ini untuk meminimalkan waktu pencarian.",
    characteristic:
      "Karakteristik: Sangat efisien dalam THM, namun berisiko menyebabkan starvation (kelaparan) pada request yang posisinya jauh.",
  },
  SCAN: {
    title: "SCAN - Elevator Algorithm",
    description:
      "Head bergerak menuju ujung track tertinggi melayani seluruh permintaan di jalurnya, lalu berbalik arah melayani sisa permintaan di sisi seberang.",
    characteristic:
      "Karakteristik: Mencegah starvation dan memberikan waktu tunggu yang lebih konsisten dibanding SSTF.",
  },
  "C-SCAN": {
    title: "C-SCAN - Circular SCAN",
    description:
      "Mirip dengan SCAN, namun saat mencapai ujung track tertinggi, head langsung melompat kembali ke track 0 tanpa melayani permintaan di perjalanan kembali.",
    characteristic:
      "Karakteristik: Lompatan ujung ke ujung dihitung sebagai gerakan head. Memberikan waktu respon yang paling seragam.",
  },
};

/**
 * Helper internal untuk menelusuri daftar track secara berurutan
 */
function traverseTracks(startHead, tracks, sequence, seekSteps) {
  let current = startHead;
  let addedThm = 0;

  for (const track of tracks) {
    const dist = Math.abs(track - current);
    addedThm += dist;
    seekSteps.push({ from: current, to: track, distance: dist });
    sequence.push(track);
    current = track;
  }

  return { lastHead: current, addedThm };
}

/**
 * 1. FCFS (First-Come, First-Served)
 */
export function calculateFCFS(initialHead, queue) {
  const sequence = [initialHead];
  const seekSteps = [];
  const { addedThm: thm } = traverseTracks(
    initialHead,
    queue,
    sequence,
    seekSteps,
  );

  return {
    algorithm: "FCFS",
    sequence,
    thm,
    avgSeek: queue.length > 0 ? thm / queue.length : 0,
    seekSteps,
  };
}

/**
 * 2. SSTF (Shortest Seek Time First)
 */
export function calculateSSTF(initialHead, queue) {
  const sequence = [initialHead];
  let thm = 0;
  const seekSteps = [];
  const remaining = [...queue];
  let current = initialHead;

  while (remaining.length > 0) {
    let minDistance = Infinity;
    let closestIndex = -1;

    for (let i = 0; i < remaining.length; i++) {
      const dist = Math.abs(remaining[i] - current);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    const nextTrack = remaining.splice(closestIndex, 1)[0];
    thm += minDistance;
    seekSteps.push({ from: current, to: nextTrack, distance: minDistance });
    sequence.push(nextTrack);
    current = nextTrack;
  }

  return {
    algorithm: "SSTF",
    sequence,
    thm,
    avgSeek: queue.length > 0 ? thm / queue.length : 0,
    seekSteps,
  };
}

/**
 * 3. SCAN (Elevator Algorithm)
 */
export function calculateSCAN(initialHead, queue, totalTrack) {
  const maxTrack = totalTrack - 1;
  const sequence = [initialHead];
  let thm = 0;
  const seekSteps = [];

  const left = queue.filter((t) => t < initialHead).sort((a, b) => b - a);
  const right = queue.filter((t) => t > initialHead).sort((a, b) => a - b);
  const same = queue.filter((t) => t === initialHead);

  same.forEach((t) => sequence.push(t));

  const firstPass = traverseTracks(initialHead, right, sequence, seekSteps);
  let current = firstPass.lastHead;
  thm += firstPass.addedThm;

  if (left.length > 0) {
    if (current < maxTrack) {
      const dist = Math.abs(maxTrack - current);
      thm += dist;
      seekSteps.push({
        from: current,
        to: maxTrack,
        distance: dist,
        isBoundary: true,
      });
      sequence.push(maxTrack);
      current = maxTrack;
    }

    const secondPass = traverseTracks(current, left, sequence, seekSteps);
    thm += secondPass.addedThm;
  }

  return {
    algorithm: "SCAN",
    sequence,
    thm,
    avgSeek: queue.length > 0 ? thm / queue.length : 0,
    seekSteps,
  };
}

/**
 * 4. C-SCAN (Circular SCAN)
 */
export function calculateCSCAN(initialHead, queue, totalTrack) {
  const maxTrack = totalTrack - 1;
  const sequence = [initialHead];
  let thm = 0;
  const seekSteps = [];

  const left = queue.filter((t) => t < initialHead).sort((a, b) => a - b);
  const right = queue.filter((t) => t > initialHead).sort((a, b) => a - b);
  const same = queue.filter((t) => t === initialHead);

  same.forEach((t) => sequence.push(t));

  const firstPass = traverseTracks(initialHead, right, sequence, seekSteps);
  let current = firstPass.lastHead;
  thm += firstPass.addedThm;

  if (left.length > 0) {
    if (current < maxTrack) {
      const dist = Math.abs(maxTrack - current);
      thm += dist;
      seekSteps.push({
        from: current,
        to: maxTrack,
        distance: dist,
        isBoundary: true,
      });
      sequence.push(maxTrack);
    }

    const jumpDistance = Math.abs(0 - maxTrack);
    thm += jumpDistance;
    seekSteps.push({
      from: maxTrack,
      to: 0,
      distance: jumpDistance,
      isJump: true,
    });
    sequence.push(0);

    const secondPass = traverseTracks(0, left, sequence, seekSteps);
    thm += secondPass.addedThm;
  }

  return {
    algorithm: "C-SCAN",
    sequence,
    thm,
    avgSeek: queue.length > 0 ? thm / queue.length : 0,
    seekSteps,
  };
}

/**
 * Menghitung semua algoritma sekaligus & menentukan algoritma paling efisien
 */
export function compareAllAlgorithms(initialHead, queue, totalTrack) {
  const fcfs = calculateFCFS(initialHead, queue);
  const sstf = calculateSSTF(initialHead, queue);
  const scan = calculateSCAN(initialHead, queue, totalTrack);
  const cscan = calculateCSCAN(initialHead, queue, totalTrack);

  const list = [fcfs, sstf, scan, cscan];
  let best = list[0];
  for (const item of list) {
    if (item.thm < best.thm) {
      best = item;
    }
  }

  const savingsFromFCFS =
    fcfs.thm > 0 ? Math.round(((fcfs.thm - best.thm) / fcfs.thm) * 100) : 0;

  return {
    FCFS: fcfs,
    SSTF: sstf,
    SCAN: scan,
    "C-SCAN": cscan,
    best,
    savingsFromFCFS,
  };
}
