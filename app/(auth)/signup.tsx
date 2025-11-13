import { auth } from "@/FirebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword  } from "firebase/auth";
import React, { useState } from "react";
import {View, Text, TextInput, Pressable, TouchableHighlight} from "react-native";
import { icons } from '@/assets/icons';
import LinkText from "@/components/LinkText";

export default function Index() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSecureText1, setIsSecureText1] = useState(true);
    const [isSecureText2, setIsSecureText2] = useState(true);

    return (
        <View className="flex-1 justify-center items-center bg-background">
            <Text className="text-primary text-4xl font-bold mb-3">Create Account</Text>
            <View className="flex-col w-3/4 justify-center items-center">
                <View className="flex-row bg-white h-[50px] mt-5 px-2 items-center border-[1px] border-gray-300 rounded-lg">
                    <TextInput
                        className="flex-1 text-primary ml-3"
                        style={{ fontSize: 17 }}
                        value={email}
                        onChangeText={setEmail}
                        placeholder='Email'
                        placeholderTextColor="#666666"
                    />
                </View>

                <View className="flex-row bg-white h-[50px] mt-5 pl-2 pr-1 items-center border-[1px] border-gray-300 rounded-lg">
                    <TextInput
                        className="flex-1 text-primary ml-3"
                        style={{ fontSize: 17 }}
                        value={password}
                        onChangeText={setPassword}
                        placeholder='Password'
                        secureTextEntry={isSecureText1}
                        placeholderTextColor="#666666"
                    />
                    <Pressable className="px-3 py-3" onPress={() => setIsSecureText1(!isSecureText1)}>
                        <icons.eye color={isSecureText1 ? '#444444':'#CCCCCC'} width={23} height={23}/>
                    </Pressable>
                </View>

                <View className="flex-row bg-white h-[50px] mt-5 pl-2 pr-1 items-center border-[1px] border-gray-300 rounded-lg">
                    <TextInput
                        className="flex-1 text-primary ml-3"
                        style={{ fontSize: 17 }}
                        value={password}
                        onChangeText={setConfirmPassword}
                        placeholder='Password'
                        secureTextEntry={isSecureText2}
                        placeholderTextColor="#666666"
                    />
                    <Pressable className="px-3 py-3" onPress={() => setIsSecureText2(!isSecureText2)}>
                        <icons.eye color={isSecureText2 ? '#444444':'#CCCCCC'} width={23} height={23}/>
                    </Pressable>
                </View>

                <TouchableHighlight
                    className="w-full mt-5 bg-secondary-100 items-center py-3 rounded"
                    underlayColor="#406caf"
                    onPress={() => {
                        console.log('login');

                    }}
                >
                    <Text className="text-light text-xl font-medium">Sign Up</Text>
                </TouchableHighlight>

                <View className="flex-row mt-4">
                    <Text className="text-primary text-lg">
                        {"Already have an account? "}
                    </Text>
                    <LinkText
                        className="text-primary text-lg font-medium"
                        color="text-secondary-100"
                        highlightStyle="text-secondary-200 underline"
                        text="Login"
                        route="/(auth)/login"
                    />
                </View>
            </View>
        </View>
    );
}