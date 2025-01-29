// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import CONFIG from "./vars";

// Initialize Firebase
const app = initializeApp(CONFIG.FIREBASE);
export const Storage = getStorage(app);