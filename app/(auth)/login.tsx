import { auth } from "@/FirebaseConfig";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth} from "firebase/auth";
import React, { useState } from "react";
import {View, Text, TextInput, Pressable, TouchableHighlight, Keyboard, TouchableWithoutFeedback, ImageBackground} from "react-native";
import LinkText from "@/components/LinkText";
import {HelperText, TextInput as PaperInput, Icon, Surface} from 'react-native-paper';
import Animated, {BounceIn, BounceOut, FadeIn, FadeInRight, FadeOut, FadeOutLeft} from "react-native-reanimated";
import {useRouter} from "expo-router";

const primary = "#424242";
const secondary = "#3893fa";

export default function Index() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isSecureText, setIsSecureText] = useState(true);
    const [loginError, setLoginError] = useState('');

    // validate email and password format
    const validate = () => {
        // reset previous error messages
        setEmailError('');
        setPasswordError('');
        setLoginError('');

        let isValid = true;

        if (!email) {
            setEmailError("Email cannot be empty.");
            isValid = false;
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Invalid email address");
            isValid = false;
        }
        if (!password) {
            setPasswordError("Password cannot be empty.");
            isValid = false;
        }

        return isValid;
    }

    // login with firebase auth
    const submitLogin = async () => {
        if (validate()) {
            try {
                await signInWithEmailAndPassword(auth, email, password);
                console.log("logged in");
                router.replace('/');
            }
            catch (error: any) {
                switch (error.code) {
                    case 'auth/user-not-found':
                        setLoginError('This email has not been registered.');
                        break;
                    case 'auth/invalid-credential':
                        setLoginError('Incorrect email or password.');
                        break;
                    case 'auth/invalid-email':
                        setLoginError('Invalid email format.');
                        break;
                    default:
                        setLoginError('Login failed. Please try again. '+error.message);
                }
            }
        }
        return;
    }

    return (
        <ImageBackground
            source={require('@/assets/images/background.png')}
            className="flex-1"
            resizeMode="cover"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-primary text-4xl font-bold mb-5">Login</Text>

                    <View className="flex-col w-3/4 justify-center items-center">
                        {/*sign up error message*/}
                        {loginError && (
                            <Animated.View
                                className="flex-row w-full px-2 py-2 bg-red-100 border-l-4 border-red-700 items-center rounded"
                                entering={FadeIn.duration(150)}
                                exiting={FadeOut.duration(150)}
                            >
                                <Icon source="close-circle" color="#b91c1c" size={25}/>
                                <Text className="text-lg ml-3">{loginError}</Text>
                            </Animated.View>
                        )}

                        {/*email input field*/}
                        <PaperInput
                            value={email}
                            onChangeText={(newEmail: string) => {
                                setEmail(newEmail);
                                setEmailError('');
                                setLoginError('');
                            }}
                            label="Email"
                            mode="outlined"
                            activeOutlineColor={secondary}
                            style={{
                                width: "100%",
                                height: 50,
                                backgroundColor: 'transparent',
                                marginTop: 20
                            }}
                            error={!!emailError}
                            theme={{ colors: { error: '#FF4C4C' } }}
                        />
                        <HelperText
                            type="error"
                            visible={!!emailError}
                            style={{ color: '#FF4C4C', fontSize: 14, alignSelf: 'flex-start' }}
                        >
                            {emailError}
                        </HelperText>

                        {/*password input field*/}
                        <PaperInput
                            value={password}
                            onChangeText={(newPassword: string) => {
                                setPassword(newPassword);
                                setPasswordError('');
                                setLoginError('');
                            }}
                            label="Password"
                            mode="outlined"
                            activeOutlineColor={secondary}
                            style={{
                                width: "100%",
                                height: 50,
                                backgroundColor: 'transparent',
                            }}
                            secureTextEntry={isSecureText}
                            right={
                                <PaperInput.Icon
                                    icon={isSecureText ? 'eye-off' : 'eye'}
                                    onPress={() => setIsSecureText(!isSecureText)}
                                    color={isSecureText ? '#666666':'#ececec'}
                                />
                            }
                            error={!!passwordError}
                            theme={{ colors: { error: '#FF4C4C' } }}
                        />
                        <HelperText
                            type="error"
                            visible={!!passwordError}
                            style={{ color: '#FF4C4C', fontSize: 14, alignSelf: 'flex-start' }}
                        >
                            {passwordError}
                        </HelperText>

                        {/*nav link to forgot password page*/}
                        <Pressable
                            className="self-end"
                            onPress={() => {
                                console.log('change password');
                            }}
                        >
                            <Text className="text-primary">
                                Forgot Password?
                            </Text>
                        </Pressable>

                        {/*login button*/}
                        <TouchableHighlight
                            className="w-full mt-5 bg-secondary-100 items-center py-3 rounded"
                            underlayColor="#366ab8"
                            onPress={async () => {
                                await submitLogin();
                            }}
                        >
                            <Text className="text-light text-xl font-medium">Login</Text>
                        </TouchableHighlight>

                        {/*nav link to sign up page*/}
                        <View className="flex-row mt-4">
                            <Text className="text-primary text-lg">
                                {"Don't have an account? "}
                            </Text>
                            <LinkText
                                className="text-primary text-lg font-medium"
                                color="text-secondary-100"
                                highlightStyle="text-secondary-200 underline"
                                text="Sign Up"
                                route="/signup"
                            />
                        </View>

                        {/*nav link to home page*/}
                        <View className="flex-row mt-4">
                            <LinkText
                                className="text-primary text-lg font-medium"
                                color="text-secondary-100"
                                highlightStyle="text-secondary-200 underline"
                                text="Continue as guest user"
                                route="/"
                            />
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ImageBackground>
    );
}