import {ImageBackground, Text, View} from "react-native";
import {auth} from "@/FirebaseConfig";
import { useFocusEffect } from '@react-navigation/native';
import {useCallback, useEffect, useState} from "react";
import api from "@/api";

export default function Index() {
    const user = auth.currentUser;
    const [games, setGames] = useState([]);

    useFocusEffect(
        useCallback(() => {
            api.get('/game/getSavedGames')
                .then(response => {
                    setGames(response.data.games);
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
                {user ? (
                    games && games.length > 0 ? (
                        games.map(game => (
                            <Text key={game.gameID} className="text-primary">
                                game: {game.gameID} - score: {game.score} - progress: {game.progress}
                            </Text>
                        ))
                    ) : (
                        <Text className="text-primary">No games saved</Text>
                    )
                ) : (
                    <Text className="text-primary">Unverified</Text>
                )}
            </View>
        </ImageBackground>
    );
}