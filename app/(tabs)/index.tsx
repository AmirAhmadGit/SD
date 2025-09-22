import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    Button,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePoints } from "../../providers/pointsProvider";

const screenWidth = Dimensions.get("window").width;

export default function ProfileScreen() {
  const { points, badges, username, setUsername, avatar, setAvatar } =
    usePoints();

  const level = Math.floor(points / 50) + 1;
  const xpToNext = points % 50;

  const [modalVisible, setModalVisible] = useState(false);
  const [tempName, setTempName] = useState(username);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const saveProfile = () => {
    setUsername(tempName);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={80} color="#2e7d32" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.username}>{username}</Text>
          <Text style={styles.level}>Level {level}</Text>
          <Text style={styles.points}>{points} Points</Text>

          {/* XP Progress Bar */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${(xpToNext / 50) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {xpToNext}/50 XP to next level
          </Text>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="edit" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Bottom Section: Badges & Achievements */}
          <View style={styles.bottomSection}>
            <Text style={styles.sectionTitle}>Badges</Text>
            {badges.length === 0 ? (
              <Text style={styles.noBadges}>No badges earned yet!</Text>
            ) : (
              <FlatList
                data={badges}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                renderItem={({ item }) => (
                  <View style={styles.badgeCard}>
                    <View style={styles.badgeIconContainer}>
                      <Text style={styles.badgeEmoji}>🏅</Text>
                    </View>
                    <Text style={styles.badgeTitle}>{item.title}</Text>
                    <Text style={styles.badgeDesc}>{item.description}</Text>
                  </View>
                )}
              />
            )}

            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.noBadges}>Coming soon!</Text>
          </View>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter username"
            />
            <Button title="Save" onPress={saveProfile} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#d4edda" }, // soft green
  container: { alignItems: "center", paddingBottom: 30 },

  // Header (top half)
  header: {
    width: screenWidth - 40,
    backgroundColor: "#c8e6c9",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 30,
    marginTop: 20,
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#a5d6a7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2e7d32",
    marginBottom: 16,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#2e7d32",
  },
  username: { fontSize: 26, fontWeight: "700", color: "#5c3a21" },
  level: { fontSize: 20, color: "#6b4c3b", marginTop: 4 },
  points: { fontSize: 20, color: "#6b4c3b", marginTop: 2 },

  progressContainer: {
    width: "80%",
    height: 20,
    backgroundColor: "#dcedc8",
    borderRadius: 10,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2e7d32",
  },
  progressText: { fontSize: 14, color: "#6b4c3b", marginTop: 4 },

  editIcon: {
    position: "absolute",
    top: 16,
    right: 16,
  },

  // Bottom half
  bottomSection: {
    width: screenWidth,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5c3a21",
    marginBottom: 8,
  },
  badgeCard: {
    width: 160,
    backgroundColor: "#e0f2e9", // soft leafy green
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#a5d6a7", // darker leaf green
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#2e7d32",
  },

  badgeEmoji: { fontSize: 28 },
  badgeTitle: { fontWeight: "700", textAlign: "center", color: "#5c3a21", fontSize: 16 },
  badgeDesc: { fontSize: 13, textAlign: "center", color: "#6b4c3b", marginTop: 4 },
  noBadges: { color: "#6b4c3b", fontStyle: "italic", marginBottom: 10 },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#c8e6c9",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#5c3a21" },
  input: {
    borderWidth: 1,
    borderColor: "#a5d6a7",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    color: "#5c3a21",
  },
});
