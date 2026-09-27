// Type declarations for Firebase modules to prevent TS7016 when installed without internal .d.ts files

declare module 'firebase/app' {
  export function initializeApp(config: any): any;
  export function getApps(): any[];
  export function getApp(name?: string): any;
  export interface FirebaseApp {
    [key: string]: any;
  }
}

declare module 'firebase/auth' {
  export function getAuth(app?: any): any;
  export function onAuthStateChanged(
    auth: any,
    nextOrObserver: (user: User | null) => any,
    error?: (err: any) => any,
    completed?: any
  ): any;
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function updateProfile(user: any, profile: { displayName?: string | null; photoURL?: string | null }): Promise<void>;
  export function signOut(auth: any): Promise<void>;
  export class GoogleAuthProvider {
    constructor();
    [key: string]: any;
  }
  export function signInWithPopup(auth: any, provider: any): Promise<any>;
  export interface User {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    phoneNumber?: string | null;
    photoURL?: string | null;
    [key: string]: any;
  }
}

declare module 'firebase/firestore' {
  export function getFirestore(app?: any): any;
  export function collection(firestore: any, path: string, ...pathSegments: string[]): any;
  export function doc(firestore: any, path: string, ...pathSegments: string[]): any;
  export function getDoc(reference: any): Promise<DocumentSnapshot>;
  export function getDocs(query: any): Promise<QuerySnapshot>;
  export function setDoc(reference: any, data: any, options?: any): Promise<void>;
  export function updateDoc(reference: any, data: any, ...moreFieldsAndValues: any[]): Promise<void>;
  export function deleteDoc(reference: any): Promise<void>;
  export function addDoc(reference: any, data: any): Promise<any>;
  export function onSnapshot(
    reference: any,
    onNext: (snapshot: QuerySnapshot) => any,
    onError?: (err: any) => any
  ): any;
  export function query(collection: any, ...queryConstraints: any[]): any;
  export function where(fieldPath: any, opStr: any, value: any): any;
  export function orderBy(fieldPath: any, directionStr?: any): any;
  export function limit(limitNumber: number): any;
  export function serverTimestamp(): any;
  export interface Firestore {
    [key: string]: any;
  }
  export interface DocumentData {
    [field: string]: any;
  }
  export interface DocumentSnapshot<T = DocumentData> {
    id: string;
    exists(): boolean;
    data(): T | undefined;
    [key: string]: any;
  }
  export interface QuerySnapshot<T = DocumentData> {
    empty: boolean;
    size: number;
    docs: DocumentSnapshot<T>[];
    forEach(callback: (result: DocumentSnapshot<T>) => void): void;
    [key: string]: any;
  }
}

declare module 'firebase/storage' {
  export function getStorage(app?: any): any;
  export function ref(storage: any, url?: string): any;
  export function uploadBytes(ref: any, data: any, metadata?: any): Promise<any>;
  export function uploadBytesResumable(ref: any, data: any, metadata?: any): any;
  export function getDownloadURL(ref: any): Promise<string>;
}

declare module 'firebase/analytics' {
  export interface Analytics {
    [key: string]: any;
  }
  export function getAnalytics(app?: any): any;
  export function isSupported(): Promise<boolean>;
}
