import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  phoneNumber?: string;
  preferences: {
    language: string;
    currency: string;
    notifications: boolean;
  };
  createdAt: any;
  updatedAt: any;
}

export interface ProfileUpdateData {
  displayName?: string;
  email?: string;
  photoURL?: string;
  phoneNumber?: string;
  preferences?: {
    language?: string;
    currency?: string;
    notifications?: boolean;
  };
}

// 사용자 프로필 생성 또는 업데이트
export const createOrUpdateUserProfile = async (user: User, profileData: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    
    const profile: UserProfile = {
      uid: user.uid,
      displayName: profileData.displayName || user.displayName || '',
      email: profileData.email || user.email || '',
      photoURL: profileData.photoURL || user.photoURL || '',
      phoneNumber: profileData.phoneNumber || '',
      preferences: {
        language: profileData.preferences?.language || 'ko',
        currency: profileData.preferences?.currency || 'KRW',
        notifications: profileData.preferences?.notifications ?? true,
      },
      createdAt: profileData.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, profile, { merge: true });
  } catch (error) {
    console.error('프로필 생성/업데이트 오류:', error);
    throw error;
  }
};

// 사용자 프로필 조회
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    throw error;
  }
};

// 사용자 프로필 부분 업데이트
export const updateUserProfile = async (uid: string, updateData: ProfileUpdateData): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    
    const updateFields: any = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    // preferences 객체가 있다면 merge
    if (updateData.preferences) {
      updateFields.preferences = updateData.preferences;
    }

    await updateDoc(userRef, updateFields);
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    throw error;
  }
};

// 사용자 프로필 삭제
export const deleteUserProfile = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { deleted: true, deletedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('프로필 삭제 오류:', error);
    throw error;
  }
};

// 사용자 여행 계획 조회
export const getUserTravelPlans = async (uid: string) => {
  try {
    const plansRef = collection(db, 'travelPlans');
    const q = query(plansRef, where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('여행 계획 조회 오류:', error);
    throw error;
  }
};

// 사용자 예약 조회
export const getUserBookings = async (uid: string) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('예약 조회 오류:', error);
    throw error;
  }
}; 