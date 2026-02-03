import React, {useEffect} from 'react';
import {View, Text, ImageBackground, TouchableOpacity} from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { icons } from '@/assets/icons';
import {useAuth} from "@/app/context/AuthContext";

const TabIcon = ({ focused, icon }: any) => {
    const IconComponent = icons[icon as keyof typeof icons];
    if (focused) {
        return (
            <View
                style={{ backgroundColor: '#EEEEEE'}}
                className="flex flex-row w-full flex-1 rounded-full justify-center items-center min-w-12 min-h-12"
            >
                <IconComponent color="#2196F3" width={32} height={32}/>
            </View>
        )
    }
    else {
        return (
            <IconComponent color="#888888" width={32} height={32}/>
        )
    }
}

const _Layout = () => {
    const {isAuthenticated, loading} = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) { return; }

        if (segments.length > 1 && segments[1] == "profile") {
            if (!isAuthenticated) {
                router.replace("/login");
            }
        }
    } ,[isAuthenticated, loading, segments])

    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    paddingTop: 10,
                    height: 75,
                    backgroundColor: '#0e0c1f',
                },
                sceneStyle: {backgroundColor: '#0e0c1f'},
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused = { focused }
                            icon = "home"
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused = { focused }
                            icon = "search"
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="saved"
                options={{
                    title: 'Saved',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused = { focused }
                            icon = "saved"
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused = { focused }
                            icon = "profile"
                        />
                    )
                }}
            />
        </Tabs>
    );
};

export default _Layout;
