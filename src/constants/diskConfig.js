export const VALID_ALGOS = ["FCFS", "SSTF", "SCAN", "C-SCAN"];

export const DEFAULT_PRESET = {
  totalTrack: "200",
  initialHead: "53",
  queueInput: "98, 183, 37, 122, 14, 124, 65, 67",
};

/**
 * Menghasilkan contoh data acak dengan posisi awal head dan antrean permintaan
 * yang selalu berbeda dari sebelumnya.
 */
export function generateRandomPreset(prevHead = null, prevQueue = "") {
  const totalTrackNum = 200;
  const queueLength = Math.floor(Math.random() * 3) + 7; // 7 hingga 9 permintaan

  let randomHead;
  do {
    randomHead = Math.floor(Math.random() * (totalTrackNum - 30)) + 15; // Rentang 15 - 184
  } while (String(randomHead) === String(prevHead));

  let queueString;
  do {
    const uniqueTracks = new Set();
    while (uniqueTracks.size < queueLength) {
      const candidate = Math.floor(Math.random() * (totalTrackNum - 10)) + 5; // Rentang 5 - 194
      if (candidate !== randomHead) {
        uniqueTracks.add(candidate);
      }
    }
    queueString = Array.from(uniqueTracks).join(", ");
  } while (queueString === prevQueue);

  return {
    totalTrack: String(totalTrackNum),
    initialHead: String(randomHead),
    queueInput: queueString,
  };
}

export function parseRequestQueue(inputStr) {
  if (!inputStr || !inputStr.trim()) return [];
  return inputStr
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter((item) => item !== "")
    .map(Number)
    .filter((num) => !Number.isNaN(num));
}

export function validateSimulationInput({ totalTrack, initialHead, queue }) {
  const tracks = Number(totalTrack);
  const head = Number(initialHead);

  if (!totalTrack || Number.isNaN(tracks) || tracks < 2) {
    return "Total track harus diisi minimal 2.";
  }
  if (initialHead === "" || Number.isNaN(head) || head < 0 || head >= tracks) {
    return `Posisi awal head harus berada di antara 0 dan ${tracks - 1}.`;
  }
  if (!queue || queue.length === 0) {
    return "Masukkan minimal satu track tujuan pada antrean permintaan.";
  }

  const outOfRange = queue.find((t) => t < 0 || t >= tracks);
  if (outOfRange !== undefined) {
    return `Track ${outOfRange} di luar batas valid (0 - ${tracks - 1}).`;
  }

  return "";
}
