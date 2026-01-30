import {ImageBackground, Text, View, Image, ScrollView, TouchableOpacity} from "react-native";
import {auth} from "@/FirebaseConfig";
import { useFocusEffect } from '@react-navigation/native';
import {useCallback, useEffect, useState} from "react";
import api from "@/api";
import {DataTable} from "react-native-paper";
import LinkText from "@/components/LinkText";
import {useRouter} from "expo-router";

export default function Index() {
    const router = useRouter();
    const user = auth.currentUser;
    const [games, setGames] = useState([]);

    useFocusEffect(
        useCallback(() => {
            api.get('/game/getSavedGames')
                .then(response => {
                    setGames(response.data.games);
                    console.log("games:", response.data.games);
                })
                .catch(error => {
                    console.log(error.response.data.message);
                })
        }, [])
    )

    return (
        <ImageBackground
            source={require('@/assets/images/background.png')}
            className="flex-1"
            resizeMode="cover"
        >
            <View className="flex-1 justify-center items-center" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <ScrollView className="mt-10" horizontal showsHorizontalScrollIndicator={true}>
                    <View className="w-[100%]">
                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title>
                                    <View style={{ width: 115 }} />
                                </DataTable.Title>
                                <DataTable.Title style={{ width: 115, paddingLeft: 10 }}>
                                    Name
                                </DataTable.Title>
                                <DataTable.Title style={{ width: 75, paddingLeft: 10, justifyContent: 'center' }}>
                                    Score
                                </DataTable.Title>
                                <DataTable.Title style={{ width: 75, paddingLeft: 10, justifyContent: 'center' }}>
                                    Progress
                                </DataTable.Title>
                            </DataTable.Header>
                        </DataTable>

                        <ScrollView className="mt-10 w-[100%]" stickyHeaderIndices={[3]} vertical showsVerticalScrollIndicator={true}>
                        <DataTable>
                            {games && games.length > 0 ? (
                                games.map(game => (
                                    <DataTable.Row key={game.gameID} style={{ height: 160 }}>
                                        <DataTable.Cell style={{ width: 115, justifyContent: 'center', justifyContent: 'center' }}>
                                            <Image
                                                source={game.cover ? { uri: `https:${game.cover.replace('t_thumb', 't_cover_big')}`}
                                                : require('@/assets/images/image-not-found.png')}
                                                className="rounded-lg"
                                                style={{ width: 99, height: 139.5, resizeMode: 'cover', borderRadius: 2 }}
                                            />
                                        </DataTable.Cell>
                                        <DataTable.Cell style={{ width: 115, paddingLeft: 10 }}>
                                            <TouchableOpacity onPress={() => { router.push(`/games/${game.gameID}`) }}>
                                                <Text className="text-primary" numberOfLines={4} ellipsizeMode="tail">
                                                    {game.name}
                                                </Text>
                                            </TouchableOpacity>
                                        </DataTable.Cell>
                                        <DataTable.Cell style={{ width: 75, paddingLeft: 10, justifyContent: 'center' }}>
                                            <Text className="text-primary">
                                                {game.score} / 10
                                            </Text>
                                        </DataTable.Cell>
                                        <DataTable.Cell style={{ width: 75, paddingLeft: 10, justifyContent: 'center' }}>
                                            <Text className="text-primary">
                                                {game.progress}
                                            </Text>
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                ))
                            ) : (
                                <Text className="text-primary">No games saved</Text>
                            )}
                        </DataTable>
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>
        </ImageBackground>
    );
}