import { auth, storage } from "@/FirebaseConfig";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import React, { useState } from "react";
import {
    View,
    Text,
    Pressable,
    TouchableHighlight,
    ImageBackground,
    TouchableWithoutFeedback, Keyboard
} from "react-native";
import LinkText from "@/components/LinkText";
import {HelperText, Icon, TextInput as PaperInput} from "react-native-paper";
import Animated, {FadeIn, FadeOut} from "react-native-reanimated";
import {useRouter} from "expo-router";
import {getDownloadURL, ref} from "@firebase/storage";
import api from "@/api";
import {signInWithCustomToken} from "firebase/auth";

const secondary = "#3893fa";

export default function Index() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [isSecureText1, setIsSecureText1] = useState(true);
    const [isSecureText2, setIsSecureText2] = useState(true);
    const [signupError, setSignupError] = useState('');

    // validate email, password and confirm password format
    const validate = () => {
        // reset previous error messages
        setUsernameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setSignupError('');

        let isValid = true;

        if (!username) {
            setUsernameError('Username cannot be empty.');
            isValid = false;
        }
        else if (!/^(?!.*[._-]{2})[a-z0-9][a-z0-9._-]{1,18}[a-z0-9]$/.test(username)) {
            setUsernameError('Usernames must be 3–20 characters long, contain only lowercase letters, numbers, dots (.), underscores (_), or dashes (-), start and end with a letter or number, and not have consecutive symbols.');
            isValid = false;
        }
        if (!email) {   // check email field format
            setEmailError("Email cannot be empty.");
            isValid = false;
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Invalid email address");
            isValid = false;
        }
        if (!password) {   // check password field format
            setPasswordError("Password cannot be empty.");
            isValid = false;
        }
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()\-_=+\[\]{};:'",.<>/?|~`]{8,}$/.test(password)) {
            setPasswordError("Password must be at least 8 characters and include uppercase, lowercase character and number.");
            isValid = false;
        }
        if (!confirmPassword) { // check confirm password field format
            setConfirmPasswordError("Confirm password cannot be empty.");
            isValid = false;
        }
        else if (password && confirmPassword != password) {
            setConfirmPasswordError("Passwords do not match.");
            isValid = false;
        }

        return isValid;
    }

    // create account in firebase auth
    const submitSignup = async () => {
        if (validate()) {
            console.log("Sign up!");
            try {
                api.post('/user/signup', {username: username, email: email, password: password, confirmPassword: confirmPassword})
                    .then(async res => {
                        await signInWithCustomToken(auth, res.data.accessToken)
                            .then((result) => {
                                router.replace('/verify');
                            })
                    })
                    .catch((error) => {
                        console.log(error.response.data.error);
                        setSignupError(error.response.data.error);
                    })
            }
            catch (error: any) {
                console.log(error);
                setSignupError(error.message);
            }
        }
    }

    return (
        <ImageBackground
            source={require('@/assets/images/background.png')}
            className="flex-1"
            resizeMode="cover"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-primary text-4xl font-bold mb-5">Create Account</Text>

                    <View className="flex-col w-3/4 justify-center items-center">
                        {/*sign up error message*/}
                        {signupError && (
                            <Animated.View
                                className="flex-row w-full px-2 py-2 bg-red-100 border-l-4 border-red-700 items-center rounded"
                                entering={FadeIn.duration(150)}
                                exiting={FadeOut.duration(150)}
                            >
                                <Icon source="close-circle" color="#b91c1c" size={25}/>
                                <Text className="text-lg ml-3">{signupError}</Text>
                            </Animated.View>
                        )}

                        {/*username input field*/}
                        <PaperInput
                            value={username}
                            onChangeText={(newUsername: string) => {
                                setUsername(newUsername);
                                setUsernameError('');
                                setSignupError('');
                            }}
                            label="Username"
                            mode="outlined"
                            activeOutlineColor={secondary}
                            style={{
                                width: "100%",
                                height: 50,
                                backgroundColor: 'transparent',
                                marginTop: 20
                            }}
                            error={!!usernameError}
                            theme={{ colors: { error: '#FF4C4C' } }}
                        />
                        <HelperText
                            type="error"
                            visible={!!usernameError}
                            style={{ color: '#FF4C4C', fontSize: 14, alignSelf: 'flex-start' }}
                        >
                            {usernameError}
                        </HelperText>

                        {/*email input field*/}
                        <PaperInput
                            value={email}
                            onChangeText={(newEmail: string) => {
                                setEmail(newEmail);
                                setEmailError('');
                                setSignupError('');
                            }}
                            label="Email"
                            mode="outlined"
                            activeOutlineColor={secondary}
                            style={{
                                width: "100%",
                                height: 50,
                                backgroundColor: 'transparent',
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
                                setSignupError('');
                            }}
                            label="Password"
                            mode="outlined"
                            activeOutlineColor={secondary}
                            style={{
                                width: "100%",
                                height: 50,
                                backgroundColor: 'transparent',
                            }}
                            error={!!passwordError}
                            theme={{ colors: { error: '#FF4C4C' } }}
                            secureTextEntry={isSecureText1}
                            right={
                                <PaperInput.Icon
                                    icon={isSecureText1 ? 'eye-off' : 'eye'}
                                    onPress={() => setIsSecureText1(!isSecureText1)}
                                    color={isSecureText1 ? '#666666':'#ececec'}
                                />
                            }
                        />
                        <HelperText
                            type="error"
                            visible={!!passwordError}
                            style={{ color: '#FF4C4C', fontSize: 14, alignSelf: 'flex-start' }}
                        >
                            {passwordError}
                        </HelperText>

                        {/*confirm password input field*/}
                        <PaperInput
                            value={confirmPassword}
                            onChangeText={(newPassword: string) => {
                                setConfirmPassword(newPassword);
                                setConfirmPasswordError('');
                                setSignupError('');
                            }}
                            label="Confirm Password"
                            mode="outlined"
                            activeOutlineColor={secondary}
                            style={{
                                width: "100%",
                                height: 50,
                                backgroundColor: 'transparent',
                            }}
                            error={!!confirmPasswordError}
                            theme={{ colors: { error: '#FF4C4C' } }}
                            secureTextEntry={isSecureText2}
                            right={
                                <PaperInput.Icon
                                    icon={isSecureText2 ? 'eye-off' : 'eye'}
                                    onPress={() => setIsSecureText2(!isSecureText2)}
                                    color={isSecureText2 ? '#666666':'#ececec'}
                                />
                            }
                        />
                        <HelperText
                            type="error"
                            visible={!!confirmPasswordError}
                            style={{ color: '#FF4C4C', fontSize: 14, alignSelf: 'flex-start' }}
                        >
                            {confirmPasswordError}
                        </HelperText>

                        {/*sign up button*/}
                        <TouchableHighlight
                            className="w-full mt-3 bg-secondary-100 items-center py-3 rounded"
                            underlayColor="#366ab8"
                            onPress={async () => {
                                console.log("sign up")
                                await submitSignup();
                            }}
                        >
                            <Text className="text-light text-xl font-medium">Sign Up</Text>
                        </TouchableHighlight>

                        {/*nav link to login page*/}
                        <View className="flex-row mt-4">
                            <Text className="text-primary text-lg">
                                {"Already have an account? "}
                            </Text>
                            <LinkText
                                className="text-primary text-lg font-medium"
                                color="text-secondary-100"
                                highlightStyle="text-secondary-200 underline"
                                text="Login"
                                route="/login"
                            />
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ImageBackground>

    );
}