import {Stack} from "expo-router";
import React from "react";

export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="signup"
                options={{
                    headerShown: false,
                    headerTransparent: true,
                    headerTitle: '',
                    headerShadowVisible: false,
                    headerBackButtonDisplayMode: 'minimal',
                }}
            />

            <Stack.Screen
                name="login"
                options={{
                    headerShown: false,
                    headerTransparent: true,
                    headerTitle: '',
                    headerShadowVisible: false,
                    headerBackButtonDisplayMode: 'minimal',
                }}
            />
        </Stack>
    );
}