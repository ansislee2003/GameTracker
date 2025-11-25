import { auth } from "@/FirebaseConfig";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    User,
    sendEmailVerification,
    onAuthStateChanged
} from "firebase/auth";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    TouchableHighlight,
    ImageBackground,
    TouchableWithoutFeedback, Keyboard, Dimensions
} from "react-native";
import { icons } from '@/assets/icons';
import LinkText from "@/components/LinkText";
import {Button, Icon, Snackbar, TextInput as PaperInput} from "react-native-paper";
import {useFocusEffect} from "expo-router";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Confetti from "react-native-reanimated-confetti/src/Confetti";

const secondary = "#3893fa";

export default function Index() {
    const [user, setUser] = useState<User | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState("");
    const [showError, setShowError] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const emailRef = useRef<LottieView>(null);  // email animation

    const { width, height } = Dimensions.get('window');

    // polling every 5s to check if user email verified
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                setIsVerified(user.emailVerified);

                if (!user.emailVerified) {
                    // send verification email once when user first loads
                    void sendEmail();

                    // start polling until verified
                    const pollTimer = setInterval(async () => {
                        await user.reload();
                        if (user.emailVerified) {   // stop polling
                            setUser(user);
                            setIsVerified(true);
                            clearInterval(pollTimer);
                        }
                    }, 5000);

                    return () => clearInterval(pollTimer);
                }
            } else {
                // user signed out
                setUser(null);
                setIsVerified(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const sendEmail = async () => {
        setUser(auth.currentUser);
        if (auth.currentUser) {
            try {
                setIsEmailLoading(true);
                const cooldown = await AsyncStorage.getItem("emailCooldown") || null;
                if (cooldown === null || parseInt(cooldown, 10) <= Date.now()) {
                    await sendEmailVerification(auth.currentUser);

                    // play animation + set new cooldown if email sent successfully
                    emailRef.current?.play();
                    const newCooldown = Date.now() + 60000;
                    await AsyncStorage.setItem("emailCooldown", newCooldown.toString());
                }
                else {
                    setError("Please wait before trying again.");
                    setShowError(true);
                }
            }
            catch (err) {
                setError("Failed to send verification email. Please try again later.");
                setShowError(true);

                // also set cooldown if failed
                const newCooldown = Date.now() + 60000;
                await AsyncStorage.setItem("emailCooldown", newCooldown.toString());
            }
            finally {
                setTimeout(() => setIsEmailLoading(false), 3000);
            }
        }
    }

    return (
        <ImageBackground
            source={require('@/assets/images/background.png')}
            className="flex-1"
            resizeMode="cover"
        >
            <View className="flex-1 justify-center items-center w-full">
                {!isVerified ? (
                    <View className="text-primary justify-center items-center w-3/4 mb-15">
                        <Text className="text-primary text-4xl font-bold mb-5 text-center">
                            Verify your account to access more features
                        </Text>
                        <View className="mb-5">
                            <LottieView
                                ref={emailRef}
                                source={require("../../assets/animations/sendingEmail.json")} // your downloaded JSON
                                autoPlay={false}
                                loop={false}
                                style={{ width: 200, height: 200 }}
                            />
                        </View>

                        <Text className="text-primary text-justify text-lg font-bold mb-1">
                            A verification email is being sent to you...
                        </Text>
                        <Text className="text-primary text-justify text-lg font-bold mb-3">
                            Please check your inbox at:
                        </Text>
                        <Text className="text-primary text-justify text-lg mb-3">
                            {`${user?.email}`}
                        </Text>
                        <Button onPress={() => sendEmail()} disabled={isEmailLoading}>
                            Resend verification email
                        </Button>
                        {/*nav link landing page*/}
                        <LinkText
                            className="text-primary text-lg font-medium mt-10"
                            color="text-secondary-100"
                            highlightStyle="text-secondary-200 underline"
                            text="Browse without verifying your account"
                            route="/"
                        />
                    </View>
                ) : (
                    <>
                        <Confetti
                            count={150}
                            fadeOut={true}
                            explosionSpeed={5}
                            batchConfetti={true}
                        />
                        <View className="flex-1 text-primary justify-center items-center w-3/4 mb-15">
                            <Text className="text-primary text-4xl font-bold mb-10 text-center">
                                You account has been verified!
                            </Text>
                            <Text className="text-primary text-center text-lg font-bold">
                                Welcome aboard — you now have full access to all personalisation and community features
                            </Text>
                            <LinkText
                                className="text-primary text-xl font-medium mt-10"
                                color="text-secondary-100"
                                highlightStyle="text-secondary-200 underline"
                                text="Start by customising your profile"
                                route="/profile"
                            />
                        </View>
                    </>
                )}
            </View>
            <Snackbar
                visible={showError}
                onDismiss={() => setShowError(false)}
                duration={3000}
            >
                {error}
            </Snackbar>
        </ImageBackground>

    );
}