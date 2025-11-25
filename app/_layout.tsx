import { Stack } from "expo-router";
import './globals.css';
import { Provider as PaperProvider } from 'react-native-paper';
import { auth } from "@/FirebaseConfig";
import {useEffect} from "react";
import {signInAnonymously} from "@firebase/auth";

export default function RootLayout() {
    useEffect(() => {
        signInAnonymously(auth)
        .then((user) => {
            console.log("Signed in anonymously");
        })
        .catch((error) => {
            console.log("Failed to sign in");
        })
    }, []);

    return (
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
                      headerTransparent: true,
                      headerTitle: '',
                      headerShadowVisible: false,
                      headerBackButtonDisplayMode: 'minimal',
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
    )
}
