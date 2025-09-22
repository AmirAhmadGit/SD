import type { LocationSubscription } from "expo-location";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { usePoints } from "../../providers/pointsProvider";

const rawBins = require("../data/RecyclingBins.json") as unknown;

type Mission = { id: string; title: string; latitude: number; longitude: number };

export default function ARScreen() {
  const router = useRouter();
  const { completedMissions, addVisitXp, incrementPermanentMission } = usePoints();

  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mapRef = useRef<MapView | null>(null);
  const locationRef = useRef<Location.LocationObjectCoords | null>(null);

  const interactionRadius = 50; // meters to interact with a bin
  const nearbyRadius = 500; // meters to show bins

  // ✅ Memoize mission locations so they're not recalculated on every render
  const missionLocations: Mission[] = useMemo(() => {
    try {
      const anyBins = rawBins as any;
      if (!anyBins || !Array.isArray(anyBins.features)) return [];
      return anyBins.features.map((feature: any, idx: number) => {
        const coords = feature?.geometry?.coordinates ?? [];
        const props = feature?.properties ?? {};
        const id = props?.id ?? props?.ObjectId ?? feature?.id ?? `bin-${idx}`;
        return {
          id: String(id),
          title: "Recycle Bin",
          latitude: coords.length >= 2 ? Number(coords[1]) : 0,
          longitude: coords.length >= 2 ? Number(coords[0]) : 0,
        };
      });
    } catch {
      return [];
    }
  }, []);

  // ✅ Distance calculator
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371e3;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ✅ Location + heading tracking
  useEffect(() => {
    let locationSub: LocationSubscription | null = null;
    let headingSub: LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // Throttled updates (15m instead of 1m)
      locationSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 15 },
        (loc) => {
          setLocation(loc.coords);
          locationRef.current = loc.coords;

          if (mapRef.current) {
            mapRef.current.setCamera({
              center: loc.coords,
              heading,
              pitch: 0,
              altitude: 1000,
              zoom: 18,
            });
          }
        }
      );

      // Heading updates (throttled ~20fps)
      let lastUpdate = 0;
      headingSub = await Location.watchHeadingAsync((headingObj) => {
        const now = Date.now();
        if (now - lastUpdate > 50) {
          lastUpdate = now;
          const mag = headingObj?.magHeading ?? 0;
          setHeading(mag);

          if (mapRef.current && locationRef.current) {
            mapRef.current.setCamera({
              center: locationRef.current,
              heading: mag,
              pitch: 0,
              altitude: 1000,
              zoom: 18,
            });
          }
        }
      });
    })();

    return () => {
      if (locationSub) locationSub.remove();
      if (headingSub) headingSub.remove();
    };
  }, []);

  // ✅ Error + Loading states
  if (errorMsg)
    return (
      <View style={styles.center}>
        <Text>{errorMsg}</Text>
      </View>
    );

  if (!location)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text>Fetching your location...</Text>
      </View>
    );

  // ✅ Only show bins within 500m
  const nearbyMissions = missionLocations.filter((m) => {
    return getDistance(location.latitude, location.longitude, m.latitude, m.longitude) <= nearbyRadius;
  });

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      }}
      showsUserLocation={false}
      showsMyLocationButton={false}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      {/* Player Interaction Radius */}
      <Circle
        center={location}
        radius={interactionRadius}
        strokeColor="rgba(46,125,50,0.8)"
        fillColor="rgba(46,125,50,0.2)"
      />

      {/* Player marker */}
      <Marker coordinate={location} title="You" />

      {/* Nearby bins */}
      {nearbyMissions.map((m) => {
        const distance = getDistance(location.latitude, location.longitude, m.latitude, m.longitude);
        const reachable = distance <= interactionRadius;

        let color = "red";
        if (completedMissions[m.id]) color = "green";
        else if (reachable) color = "yellow";

        return (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.title}
            description={reachable ? "Tap to start mission!" : "Walk closer to activate."}
            onPress={() => {
              if (!reachable) return;
              addVisitXp(m.id, 10); // daily XP
              incrementPermanentMission("p1"); // visit 5 bins
              incrementPermanentMission("p2"); // complete 5 missions
              router.push(`/game/${m.id}`);
            }}
            pinColor={color}
          />
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
