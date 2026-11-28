const STORAGE_KEY = "diskmotion_game_achievements_v1";

export const ACHIEVEMENT_DEFS = [
  {
    id: "first_blood",
    title: "First Sector Served",
    description: "Successfully process your very first disk I/O request.",
    icon: "target",
  },
  {
    id: "combo_5",
    title: "Momentum Builder",
    description: "Reach a 5x combo streak without missing any request.",
    icon: "zap",
  },
  {
    id: "combo_12",
    title: "Head Master",
    description: "Reach an impressive 12x combo streak.",
    icon: "flame",
  },
  {
    id: "zero_seek",
    title: "Dead-On Accuracy",
    description: "Serve a request with zero cylinder travel distance.",
    icon: "crosshair",
  },
  {
    id: "vip_saver",
    title: "VIP Priority",
    description: "Rescue an urgent red request with less than 1.5s left.",
    icon: "shield",
  },
  {
    id: "score_5000",
    title: "Throughput King",
    description: "Score 5,000 points in a single session.",
    icon: "trophy",
  },
  {
    id: "level_4",
    title: "Overclocked Controller",
    description: "Survive up to Level 4 workload intensity.",
    icon: "cpu",
  },
  {
    id: "served_30",
    title: "I/O Workhorse",
    description: "Serve 30 requests in a single run.",
    icon: "hard-drive",
  },
];

export function loadAchievements() {
  let savedMap = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      savedMap = JSON.parse(raw) || {};
    }
  } catch {
    savedMap = {};
  }

  return ACHIEVEMENT_DEFS.map((def) => {
    const record = savedMap[def.id];
    return {
      ...def,
      unlocked: Boolean(record?.unlocked),
      unlockedAt: record?.unlockedAt || null,
    };
  });
}

export function saveAchievements(list) {
  try {
    const map = {};
    list.forEach((a) => {
      if (a.unlocked) {
        map[a.id] = { unlocked: true, unlockedAt: a.unlockedAt || Date.now() };
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

export function resetAchievements() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
  return ACHIEVEMENT_DEFS.map((def) => ({
    ...def,
    unlocked: false,
    unlockedAt: null,
  }));
}
