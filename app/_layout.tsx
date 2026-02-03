import { Stack } from "expo-router";
import './globals.css';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { auth } from "@/FirebaseConfig";
import {useEffect} from "react";
import {onAuthStateChanged, signInAnonymously} from "firebase/auth";
import {AuthProvider, useAuth} from "@/app/context/AuthContext";

export default function RootLayout() {
    return (
        <AuthProvider>
          <PaperProvider>
              <Stack
                  screenOptions={{
                      contentStyle: {
                          backgroundColor: "#0e0c1f"
                      }
                  }}
              >
                  <Stack.Screen
                      name="(tabs)"
                      options={{
                          headerShown: false,
                      }}
                  />

                  <Stack.Screen
                      name="games/[id]"
                      options={{
                          headerTransparent: false,
                          headerTitle: '',
                          headerShadowVisible: false,
                          headerBackButtonDisplayMode: 'minimal',
                          headerStyle: {backgroundColor: 'rgba(255,255,255,0)'},
                      }}
                  />

                  <Stack.Screen
                      name="(auth)"
                      options={{
                          headerTransparent: true,
                          headerTitle: '',
                          headerShadowVisible: false,
                          headerBackButtonDisplayMode: 'minimal',
                      }}
                  />
              </Stack>
          </PaperProvider>
        </AuthProvider>
    )
}
