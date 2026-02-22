import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const modules = [
    {
      id: 'shape-kingdom',
      title: 'Shape Kingdom',
      subtitle: 'Match shapes & colors',
      icon: 'shape-line' as const,
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#FF8E53'],
      route: 'ShapeKingdom' as keyof RootStackParamList,
    },
    {
      id: 'counting-forest',
      title: 'Counting Forest',
      subtitle: 'Count fruits & numbers',
      icon: 'park' as const,
      color: '#4CAF50',
      gradient: ['#4CAF50', '#66BB6A'],
      route: 'CountingForest' as keyof RootStackParamList,
    },
    {
      id: 'pattern-park',
      title: 'Pattern Park',
      subtitle: 'Coming soon!',
      icon: 'pattern' as const,
      color: '#9C27B0',
      gradient: ['#9C27B0', '#BA68C8'],
      route: 'Home' as keyof RootStackParamList,
      disabled: true,
    },
    {
      id: 'logic-land',
      title: 'Logic Land',
      subtitle: 'Coming soon!',
      icon: 'psychology' as const,
      color: '#2196F3',
      gradient: ['#2196F3', '#64B5F6'],
      route: 'Home' as keyof RootStackParamList,
      disabled: true,
    },
  ];

  const handleModulePress = (module: typeof modules[0]) => {
    if (module.disabled) return;
    navigation.navigate(module.route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6A11CB', '#2575FC']}
        style={styles.background}
      />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="school" size={40} color="white" />
          <Text style={styles.title}>Little Logic Heroes</Text>
          <Text style={styles.subtitle}>Fun learning adventures for kids</Text>
        </View>

        {/* Modules Grid */}
        <View style={styles.modulesGrid}>
          {modules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleCard}
              onPress={() => handleModulePress(module)}
              activeOpacity={module.disabled ? 1 : 0.7}
            >
              <LinearGradient
                colors={module.gradient}
                style={[
                  styles.moduleGradient,
                  module.disabled && styles.moduleDisabled,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.moduleIconContainer}>
                  <MaterialIcons
                    name={module.icon}
                    size={40}
                    color="white"
                  />
                </View>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
                
                {module.disabled && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                )}
                
                {!module.disabled && (
                  <View style={styles.playButton}>
                    <MaterialIcons name="play-arrow" size={24} color="white" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Designed for ages 3-5  No ads  No in-app purchases
          </Text>
          <View style={styles.features}>
            <View style={styles.feature}>
              <MaterialIcons name="child-friendly" size={20} color="white" />
              <Text style={styles.featureText}>Kid-Safe</Text>
            </View>
            <View style={styles.feature}>
              <MaterialIcons name="offline-bolt" size={20} color="white" />
              <Text style={styles.featureText}>Offline</Text>
            </View>
            <View style={styles.feature}>
              <MaterialIcons name="accessibility" size={20} color="white" />
              <Text style={styles.featureText}>Inclusive</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'ComicNeue-Bold',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'ComicNeue-Regular',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  moduleCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  moduleGradient: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  moduleDisabled: {
    opacity: 0.7,
  },
  moduleIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'ComicNeue-Bold',
  },
  moduleSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontFamily: 'ComicNeue-Regular',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  comingSoonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  playButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'ComicNeue-Regular',
  },
  features: {
    flexDirection: 'row',
    gap: 20,
  },
  feature: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: 'white',
    marginTop: 5,
    fontFamily: 'ComicNeue-Regular',
  },
});

export default HomeScreen;
