import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TutorialOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ isVisible, onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Shape Kingdom!',
      description: 'Drag shapes to match them with their colored homes.',
      icon: 'touch-app',
    },
    {
      title: 'Match Colors and Shapes',
      description: 'Match each shape to its matching color and shape.',
      icon: 'color-lens',
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <MaterialIcons name={steps[step].icon as any} size={60} color="#6A11CB" />
        
        <Text style={styles.title}>{steps[step].title}</Text>
        <Text style={styles.description}>{steps[step].description}</Text>
        
        <View style={styles.stepIndicator}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === step ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {step === steps.length - 1 ? 'Start Playing!' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 10000,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  stepIndicator: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#6A11CB',
  },
  inactiveDot: {
    backgroundColor: '#E0E0E0',
  },
  nextButton: {
    backgroundColor: '#6A11CB',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  nextText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TutorialOverlay;
