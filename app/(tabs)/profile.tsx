import {ScrollView, Text, View} from "react-native";
import {Image} from "expo-image";
import LinkText from "@/components/LinkText";
import React from "react";

 const user = {
    name: "John",

 }

export default function Index() {
    return (
        <View className="flex-1 px-5 justify-center items-center bg-background">
            <ScrollView className="w-full">
                <View className="w-full justify-center items-center">
                    <Image
                        source={require('@/assets/images/default_profile.png')}
                        style={{ width: 85, height: 85, marginTop: 70, borderRadius: 50, borderWidth: 3, borderColor: '#FDFDFD' }}
                    />
                    <Text className="text-primary text-xl font-medium mt-2">{user.name}</Text>
                </View>
                <Text className="text-primary text-lg font-medium mt-3">Statistics</Text>
                <Text className="text-primary text-lg font-medium mt-3">Statistics</Text>
                <Text className="text-primary text-lg font-medium mt-3">Your Top Picks</Text>
                <LinkText
                    className="text-primary text-lg"
                    color="text-primary"
                    highlightColor="text-secondary-100 underline"
                    text="Login"
                    route="/(auth)/login"
                />
            </ScrollView>
        </View>
    );
}