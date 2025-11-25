import { auth } from "@/FirebaseConfig";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword, User} from "firebase/auth";
import React, {useCallback, useEffect, useState} from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    TouchableHighlight,
    ImageBackground,
    TouchableWithoutFeedback, Keyboard
} from "react-native";
import { icons } from '@/assets/icons';
import LinkText from "@/components/LinkText";
import {Icon, TextInput as PaperInput} from "react-native-paper";
import {useFocusEffect} from "expo-router";
import LottieView from "lottie-react-native";

const secondary = "#3893fa";

export default function Index() {
    const [user, setUser] = useState<User | null>(null);
    const [isVerified, setIsVerified] = useState(false);

    // polling every 5s to check if user email verified
    useFocusEffect(
        useCallback(() => {
            setUser(auth.currentUser);
            setIsVerified(auth.currentUser? auth.currentUser.emailVerified : false);

            const pollTimer = setInterval(async () => {
                if (auth.currentUser) {
                    await auth.currentUser.reload();
                    if (auth.currentUser.emailVerified) {
                        setUser(auth.currentUser);
                        setIsVerified(true);
                        clearInterval(pollTimer);   // stop polling once verified
                    }
                }
            }, 5000)

            return () => clearInterval(pollTimer);
        }, [])
    )

    return (
        <ImageBackground
            source={require('@/assets/images/background.png')}
            className="flex-1"
            resizeMode="cover"
        >
            <View className="flex-1 justify-center items-center w-full">
                {user && (
                    <View className="text-primary justify-center items-center w-3/4 mb-15">
                        <Text className="text-primary text-4xl font-bold mb-15 text-center">
                            Verify your account to access more features
                        </Text>
                        <LottieView
                            source={require("../../assets/animations/sendingEmail.json")} // your downloaded JSON
                            autoPlay={false}
                            loop={false}
                            style={{ width: 200, height: 200, marginBottom: "3.75rem" }}
                        />
                        <Text className="text-primary text-justify text-lg font-bold mb-1">
                            A verification email has been sent to you.
                        </Text>
                        <Text className="text-primary text-justify text-lg font-bold mb-3">
                            Please check your inbox at:
                        </Text>
                        <Text className="text-primary text-justify text-lg mb-3">
                            {`${user.email}`}
                        </Text>
                    </View>
                )}

                {/*nav link landing page*/}
                <LinkText
                    className="text-primary text-lg font-medium"
                    color="text-secondary-100"
                    highlightStyle="text-secondary-200 underline"
                    text="Browse without verifying your account."
                    route="/"
                />
            </View>
        </ImageBackground>

    );
}