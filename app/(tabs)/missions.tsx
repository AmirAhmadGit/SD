import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePoints } from "../../providers/pointsProvider";

// Daily missions
const dailyMissions = [
  { id: "d1", title: "Visit a Recycling Bin", description: "Go to a recycling bin nearby and tap it.", points: 10 },
  { id: "d2", title: "Complete a Mission", description: "Finish any mission to earn extra XP.", points: 10 },
];

// Permanent missions
const permanentMissions = [
  { id: "p1", title: "Visit 5 Recycling Bins", description: "Go to 5 recycling bins and tap it.", points: 10, goal: 5 },
  { id: "p2", title: "Complete 5 Missions", description: "Finish 5 missions.", points: 10, goal: 5 },
];

// Timer until midnight
function getTimeLeft() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export default function MissionsScreen() {
  const { visitTracker, completedMissions, permanentMissionProgress } = usePoints();
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 60000);
    return () => clearInterval(interval);
  }, []);

  const renderDailyMission = ({ item }: any) => {
    const today = new Date().toISOString().slice(0, 10);
    const completedToday = visitTracker[item.id] === today;
    const bgColor = completedToday ? "#c8e6c9" : "#f0f0f0";

    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: bgColor }]}>
        <View style={styles.cardContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
          <View style={styles.pointsCircle}>
            {completedToday ? (
              <MaterialIcons name="check-circle" size={24} color="white" />
            ) : (
              <Text style={styles.pointsText}>{item.points} XP</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPermanentMission = ({ item }: any) => {
    const progress = permanentMissionProgress[item.id] ?? 0;
    const completed = completedMissions[item.id] ?? false;
    const bgColor = completed ? "#c8e6c9" : "#f0f0f0";

    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: bgColor }]}>
        <View style={styles.cardContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.progressText}>
              Progress: {progress}/{item.goal}
            </Text>
          </View>
          <View style={styles.pointsCircle}>
            {completed ? (
              <MaterialIcons name="check-circle" size={24} color="white" />
            ) : (
              <Text style={styles.pointsText}>{item.points} XP</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dailyHeader}>
        <Text style={styles.sectionTitle}>Daily Missions</Text>
        <Text style={styles.timer}>{timeLeft} left</Text>
      </View>

      <FlatList
        data={dailyMissions}
        keyExtractor={(item) => item.id}
        renderItem={renderDailyMission}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Missions</Text>
      <FlatList
        data={permanentMissions}
        keyExtractor={(item) => item.id}
        renderItem={renderPermanentMission}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#d4edda", padding: 16 },
  dailyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#5c3a21" },
  timer: { fontSize: 14, fontWeight: "600", color: "#2e7d32" },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3 },
  cardContent: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: "#5c3a21" },
  desc: { fontSize: 14, color: "#6b4c3b" },
  progressText: { fontSize: 14, fontWeight: "600", color: "#2e7d32", marginTop: 4 },
  pointsCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#2e7d32", justifyContent: "center", alignItems: "center", marginLeft: 12 },
  pointsText: { color: "white", fontWeight: "700", textAlign: "center", fontSize: 12 },
});
