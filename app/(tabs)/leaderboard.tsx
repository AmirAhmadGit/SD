// app/(tabs)/leaderboard.tsx
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePoints } from "../../providers/pointsProvider";

// Sample leaderboard data
const sampleLeaderboard = [
  { id: "1", name: "Alice", points: 120, avatar: "https://i.pravatar.cc/150?img=1" },
  { id: "2", name: "Bob", points: 105, avatar: "https://i.pravatar.cc/150?img=2" },
  { id: "3", name: "Charlie", points: 95, avatar: "https://i.pravatar.cc/150?img=3" },
  { id: "4", name: "Diana", points: 80, avatar: "https://i.pravatar.cc/150?img=4" },
];

export default function LeaderboardScreen() {
  const { username, avatar, points } = usePoints();

  // Insert player into leaderboard
  const leaderboard = [
    ...sampleLeaderboard,
    {
      id: "me",
      name: username,
      points,
      avatar, // ✅ use exactly what the player set
    },
  ];

  // Sort by points (highest first)
  leaderboard.sort((a, b) => b.points - a.points);

  const renderPlayer = ({ item, index }: any) => {
    const isMe = item.id === "me";
    let bgColor = isMe ? "#c8e6c9" : index % 2 === 0 ? "#f0f0f0" : "#e0e0e0";

    return (
      <View style={[styles.row, { backgroundColor: bgColor }]}>
        <Text style={styles.rank}>{index + 1}</Text>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.emptyAvatar]} />
        )}
        <Text style={[styles.name, isMe && styles.meName]}>
          {item.name} {isMe && "(You)"}
        </Text>
        <Text style={styles.points}>{item.points} XP</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Leaderboard</Text>
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayer}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#d4edda", padding: 16 },
  header: { fontSize: 24, fontWeight: "700", color: "#5c3a21", marginBottom: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  rank: { width: 30, fontSize: 16, fontWeight: "700", color: "#5c3a21" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  emptyAvatar: { backgroundColor: "#ccc" }, // placeholder circle if no avatar set
  name: { flex: 1, fontSize: 16, fontWeight: "600", color: "#5c3a21" },
  meName: { color: "#2e7d32" }, // highlight your name in green
  points: { fontSize: 16, fontWeight: "700", color: "#2e7d32" },
});
