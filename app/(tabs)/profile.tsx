import {ActivityIndicator, ImageBackground, SafeAreaView, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import LinkText from "@/components/LinkText";
import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import {onAuthStateChanged, updateProfile, User} from "firebase/auth";
import {db} from "@/FirebaseConfig";
import {useRouter} from "expo-router";
import {Icon} from "react-native-paper/src";
import * as ImagePicker from 'expo-image-picker';
import api from "@/api";
import {TextInput, Button, IconButton, Snackbar} from "react-native-paper";
import {fileTypeFromBlob, fileTypeFromBuffer} from "file-type";
import { collection, query, where, getDocs } from "firebase/firestore"
import {AuthContext, useAuth} from "@/app/context/AuthContext";

export default function Index() {
    const auth = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [newDisplayName, setNewDisplayName] = useState<string>("");
    const [editDisplayName, setEditDisplayName] = useState<boolean>(false);
    const [avatarVisible, setAvatarVisible] = useState(true);
    const [avatarLoaded, setAvatarLoaded] = useState(false);
    const [editOverlay, setEditOverlay] = useState(false);
    const [error, setError] = useState("");
    const [showError, setShowError] = useState(false);
    const inputRef = useRef(null);

    const updateAvatar = async () => {
        if (auth && auth.user && !auth.user.isAnonymous) {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7
            })

            if (!result.canceled && result.assets) {
                const asset = result.assets[0];
                const image = await fetch(asset.uri);
                const buffer = await image.arrayBuffer(); // works in RN fetch
                const uint8 = new Uint8Array(buffer);
                const type = await fileTypeFromBuffer(uint8);

                if (type?.mime === "image/jpeg" || type?.mime === "image/png") {
                    const formData = new FormData();
                    formData.append("image", {
                        uri: asset.uri,
                        type: type.mime,
                        name: `${auth.user.uid}.${type.ext}`,
                    } as any);

                    api.post('/user/uploadAvatarByUID', formData)
                        .then(async (res) => {
                            setAvatarVisible(false);        // unmount to update image
                            await auth.update();
                            setAvatarVisible(true);
                        })
                        .catch((err) => {
                            console.log(err.message);
                            setError(err.message);
                            setShowError(true);
                            setAvatarVisible(true);
                        })
                }
            }
        }
        else {
            setError("Please sign in to customise your profile");
            setShowError(true);
        }
    }

    return (
        <ImageBackground
            source={require('@/assets/images/background.png')}
            className="flex-1"
            resizeMode="cover"
        >
            <View className="flex-1 px-5 justify-center items-center" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <ScrollView className="w-full">
                    <View className="w-full justify-center items-center mt-20">
                        <View className="relative justify-center items-center w-[94px] h-[94px] rounded-full bg-black border-4 border-gray-200 overflow-hidden">
                            {editOverlay && (
                                <View className="absolute" style={{zIndex:2}}>
                                    <Icon source="pencil" size={35} color="#DDDDDD"/>
                                </View>
                            )}
                            <TouchableOpacity style={{zIndex:1}} activeOpacity={0.6} onPressIn={() => setEditOverlay(true)}
                                              onPressOut={async () => {
                                                  await updateAvatar();
                                                  setEditOverlay(false);
                                              }}
                            >
                                {avatarVisible ? (
                                    <Image
                                        source={ auth.user?.photoURL }
                                        style={{ width: 90, height: 90, opacity: avatarLoaded ? 0 : 1 }}
                                        contentFit="cover"
                                        transition={500}
                                    />
                                ) : (
                                    <ActivityIndicator size="small" color="#AAAAAA" />
                                )}
                            </TouchableOpacity>
                        </View>
                        {/*display name*/}
                        <View className="flex-row items-center h-[25] mt-4">
                            {!editDisplayName ? (
                                <>
                                    <Text className="text-primary text-xl font-medium max-w-[300]">{auth.user?.displayName || "New_User"}</Text>
                                    <IconButton
                                        style={{margin: 0, padding: 0, marginLeft: 5, width: 25, height: 25}}
                                        icon="pencil"
                                        size={20}
                                        onPress={async () => {
                                            setNewDisplayName(auth.user?.displayName || "");
                                            setEditDisplayName(true);
                                            setTimeout(() => {
                                                if (inputRef.current) {
                                                    inputRef.current.focus();
                                                }
                                            },0)
                                        }}
                                    />
                                </>
                            ) : (
                                <>
                                    <TextInput
                                        ref={inputRef}
                                        mode="outlined"
                                        value={newDisplayName}
                                        style={{color: '#ececec', fontSize: 17.1, fontWeight: '500', height: 30, maxWidth: 310}}
                                        contentStyle={{paddingVertical: 0}}
                                        theme={{colors: { primary: '#ececec', outline: '#ececec'}}}
                                        onChangeText={setNewDisplayName}
                                        maxLength={32}
                                        onBlur={async () => {
                                            const name = newDisplayName.trim();
                                            if (name.length > 0 && name.length <= 32 && auth.user) {
                                                await updateProfile(auth.user, { displayName: name });
                                            }
                                            setEditDisplayName(false);

                                        }}
                                    />
                                    <IconButton
                                        style={{margin: 0, padding: 0, marginLeft: 5, width: 25, height: 25}}
                                        icon="undo"
                                        size={20}
                                        onPress={() => {
                                            setEditDisplayName(false);
                                            setNewDisplayName(auth.user?.displayName || "");
                                        }}
                                    />
                                </>
                            )}
                        </View>
                        {/*username handle*/}
                        <View className="flex-row">
                            <Text className="text-gray-300 text-xl mt-1">{auth.handle ? `@${auth.handle}` : ""}</Text>
                        </View>
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
                    <LinkText
                        className="text-primary text-lg"
                        color="text-primary"
                        highlightColor="text-secondary-100 underline"
                        text="verify"
                        route="/verify"
                    />
                </ScrollView>

                <Snackbar
                    visible={showError}
                    onDismiss={() => setShowError(false)}
                    duration={3000}
                >
                    {error}
                </Snackbar>
            </View>
        </ImageBackground>
    );
}