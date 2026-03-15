// src/utils/accessControl.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';

const INSTALL_DATE_KEY = 'app_install_date';
const TRIAL_DAYS = 90; // 3 months (approximate)

export interface AccessStatus {
  isFullAccess: boolean;
  daysRemaining?: number;
  isTrialExpired: boolean;
}

/**
 * Check if user has full access (either in trial period or has purchased)
 */
export const checkAccess = async (): Promise<AccessStatus> => {
  try {
    // 1. First check if user has purchased (subscription active)
    const hasSubscription = await checkSubscriptionStatus();
    if (hasSubscription) {
      return { isFullAccess: true, isTrialExpired: false };
    }
    
    // 2. If no subscription, check trial period
    const installDate = await getInstallDate();
    if (!installDate) {
      // First launch - set install date and grant full access
      await setInstallDate();
      return { isFullAccess: true, isTrialExpired: false };
    }
    
    // Calculate days since installation
    const now = new Date();
    const installTime = new Date(installDate).getTime();
    const daysSinceInstall = Math.floor((now.getTime() - installTime) / (1000 * 60 * 60 * 24));
    
    const isTrialExpired = daysSinceInstall >= TRIAL_DAYS;
    const daysRemaining = Math.max(0, TRIAL_DAYS - daysSinceInstall);
    
    return {
      isFullAccess: !isTrialExpired, // Full access only during trial
      daysRemaining,
      isTrialExpired
    };
  } catch (error) {
    console.error('Error checking access:', error);
    // Fail safe: deny access if we can't verify
    return { isFullAccess: false, isTrialExpired: true };
  }
};

/**
 * Get installation date from storage
 */
const getInstallDate = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(INSTALL_DATE_KEY);
};

/**
 * Set installation date (first app launch)
 */
const setInstallDate = async (): Promise<void> => {
  const now = new Date().toISOString();
  await AsyncStorage.setItem(INSTALL_DATE_KEY, now);
};

/**
 * Check if user has an active subscription
 * This will be implemented with RevenueCat/Adapty
 */
const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    // Check if user has the 'premium' entitlement
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};