export const VALID_ALGOS = ["FCFS", "SSTF", "SCAN", "C-SCAN"];

export const DEFAULT_PRESET = {
  totalTrack: "200",
  initialHead: "53",
  queueInput: "98, 183, 37, 122, 14, 124, 65, 67",
  direction: "right",
};

export function parseRequestQueue(rawInput) {
  return rawInput
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "" && !Number.isNaN(Number(item)))
    .map((item) => Number(item));
}

export function validateSimulationInput({ totalTrack, initialHead, queue }) {
  const tracks = Number(totalTrack);
  const head = Number(initialHead);

  if (totalTrack === "" || Number.isNaN(tracks) || tracks < 2) {
    return "Total track harus berupa angka minimal 2.";
  }
  if (initialHead === "" || Number.isNaN(head) || head < 0 || head >= tracks) {
    return `Posisi awal head harus antara 0 dan ${tracks - 1}.`;
  }
  if (queue.length === 0) {
    return "Antrean permintaan tidak boleh kosong.";
  }

  const outOfBounds = queue.filter((t) => t < 0 || t >= tracks);
  if (outOfBounds.length > 0) {
    return `Track [${outOfBounds.join(", ")}] berada di luar rentang (0 - ${tracks - 1}).`;
  }

  return "";
}
