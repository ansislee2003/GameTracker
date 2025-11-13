import { auth } from "@/FirebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword  } from "firebase/auth";
import React, { useState } from "react";
import {View, Text, TextInput, Pressable, TouchableHighlight} from "react-native";
import { icons } from '@/assets/icons';
import LinkText from "@/components/LinkText";
import { TextInput as PaperInput } from 'react-native-paper';

const primary = "#424242";
const secondary = "#438ee4";

export default function Index() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSecureText, setIsSecureText] = useState(true);

    return (
        <View className="flex-1 justify-center items-center bg-background">
            <Text className="text-primary text-4xl font-bold mb-3">Login</Text>
            <View className="flex-col w-3/4 justify-center items-center">
                <PaperInput
                    label="Email"
                    mode="outlined"
                    outlineColor={primary}
                    activeOutlineColor={secondary}
                    textColor={primary}
                    style={{
                        width: "100%",
                        height: 50,
                        backgroundColor: 'white',
                        marginTop: 20
                    }}
                />

                <PaperInput
                    label="Password"
                    mode="outlined"
                    outlineColor={primary}
                    activeOutlineColor={secondary}
                    textColor={primary}
                    style={{
                        width: "100%",
                        height: 50,
                        backgroundColor: 'white',
                        marginTop: 20
                    }}
                    secureTextEntry={!isSecureText}
                    right={
                        <PaperInput.Icon
                            icon={isSecureText ? 'eye' : 'eye-off'}
                            onPress={() => setIsSecureText(!isSecureText)}
                            color={isSecureText ? '#444444':'#CCCCCC'}
                        />
                    }
                />

                <Pressable
                    className="mt-4 self-end"
                    onPress={() => {
                        console.log('change password');
                    }}
                >
                    <Text className="text-primary">
                        Forgot Password?
                    </Text>
                </Pressable>

                <TouchableHighlight
                    className="w-full mt-5 bg-secondary-100 items-center py-3 rounded"
                    underlayColor="#406caf"
                    onPress={() => {
                        console.log('login');
                    }}
                >
                    <Text className="text-light text-xl font-medium">Login</Text>
                </TouchableHighlight>

                <View className="flex-row mt-4">
                    <Text className="text-primary text-lg">
                        {"Don't have an account? "}
                    </Text>
                    <LinkText
                        className="text-primary text-lg font-medium"
                        color="text-secondary-100"
                        highlightStyle="text-secondary-200 underline"
                        text="Sign Up"
                        route="/(auth)/signup"
                    />
                </View>
            </View>
        </View>
    );
}