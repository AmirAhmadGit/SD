import React, { createContext, useContext, useState } from "react";

type PointsContextType = {
  points: number;
  addXp: (amount: number) => void;
  badges: any[];
  setBadges: React.Dispatch<React.SetStateAction<any[]>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  avatar: string | null;
  setAvatar: React.Dispatch<React.SetStateAction<string | null>>;
  visitTracker: Record<string, string>; // missionId -> YYYY-MM-DD
  completedMissions: Record<string, boolean>; // missionId -> completed
  permanentMissionProgress: Record<string, number>; // missionId -> current progress
  addVisitXp: (missionId: string, xp: number) => boolean;
  completeMission: (missionId: string, xp: number) => void;
  incrementPermanentMission: (missionId: string, increment?: number, goal?: number, xp?: number) => void;
};

const PointsContext = createContext<PointsContextType | null>(null);

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<any[]>([
    { id: "b0", title: "Began your journey", description: "Started the app for the first time" },
  ]);
  const [username, setUsername] = useState("Player");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [visitTracker, setVisitTracker] = useState<Record<string, string>>({});
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});
  const [permanentMissionProgress, setPermanentMissionProgress] = useState<Record<string, number>>({});

  const addXp = (amount: number) => setPoints((prev) => prev + amount);

  const addVisitXp = (missionId: string, xp: number) => {
  const today = new Date().toISOString().slice(0, 10);

  // If visiting a recycling bin, also count for daily mission "d1"
  let added = false;
  if (missionId.startsWith("bin-") || missionId === "recyclingBin") {
    if (visitTracker["d1"] !== today) {
      setPoints(prev => prev + xp);
      setVisitTracker(prev => ({ ...prev, ["d1"]: today }));
      added = true;
    }
  }

  // Also track individual bins (for permanent mission)
  if (!visitTracker[missionId] || visitTracker[missionId] !== today) {
    setPoints(prev => prev + xp);
    setVisitTracker(prev => ({ ...prev, [missionId]: today }));
    added = true;
  }

  return added;
};


  const completeMission = (missionId: string, xp: number) => {
    if (!completedMissions[missionId]) {
      addXp(xp);
      setCompletedMissions((prev) => ({ ...prev, [missionId]: true }));
    }
  };

  const incrementPermanentMission = (missionId: string, increment = 1, goal = 5, xp = 10) => {
    setPermanentMissionProgress((prev) => {
      const newProgress = (prev[missionId] ?? 0) + increment;
      if (newProgress >= goal) {
        // mark completed and award XP if not already
        completeMission(missionId, xp);
        return { ...prev, [missionId]: goal };
      }
      return { ...prev, [missionId]: newProgress };
    });
  };

  return (
    <PointsContext.Provider
      value={{
        points,
        addXp,
        badges,
        setBadges,
        username,
        setUsername,
        avatar,
        setAvatar,
        visitTracker,
        completedMissions,
        permanentMissionProgress,
        addVisitXp,
        completeMission,
        incrementPermanentMission,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (!context) throw new Error("usePoints must be used within a PointsProvider");
  return context;
}
