import {View, Text, ScrollView, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from "react";
import {useLocalSearchParams} from "expo-router";
import {Image} from "expo-image";
import StarIcon from "@/assets/icons/star.svg";
import axios from "axios";

const API_BASE_URL = 'https://api-idspf7h7kq-uc.a.run.app';

const GameDetails = () => {
    const { id } = useLocalSearchParams();

    const [game, setGame] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.post(`${API_BASE_URL}/getGameById`, {"gameID": id},
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        .then(response => {
            setGame(response.data);
            setLoading(false);
            console.log(response.data)
        })
        .catch(error => {
            setError(error);
        })
    }, []);

    if (!loading) {
        console.log(game, `{gameID: ${id}}`);
        return (
            <View className="flex-1 bg-background">
                <ScrollView>
                    <Image
                        className="w-[300px] h-[300px]"
                        source={game.cover ? { uri: `https:${game.cover.url.replace('t_thumb', 't_original')}`}
                                : require('@/assets/images/image-not-found.png')}
                        style={{ width: "100%", height: 520, resizeMode: 'cover', borderRadius: 2 }}
                    />

                    <View className="py-3.5 px-3.5">
                        <Text className="text-primary text-xl font-medium mb-1">{game.name}</Text>
                        <Text className="text-primary mb-1">
                            {game.first_release_date ? new Date(game.first_release_date * 1000).toLocaleDateString()
                            : '-'}
                        </Text>
                        <View className="flex-row items-center mb-2">
                            <StarIcon width={16} height={16} color="#FFD700"/>
                            {game.total_rating ? (
                                    <>
                                        <Text className="mr-2">{game.total_rating.toFixed(1)} / 100</Text>
                                        <Text>({game.total_rating_count} votes)</Text>
                                    </>
                            ): (
                                <Text>N/A</Text>
                            )}
                        </View>
                        <View className="flex-row flex-wrap gap-2 mb-3">
                            {game.game_type && (
                                <Text className="bg-blue-300 px-2 py-0.5 rounded">{game.game_type.type}</Text>
                            )}
                            {game.genres && (
                                game.genres.map(g => (
                                    <Text className="bg-orange-300 px-2 py-0.5 rounded" key={g.id}>
                                        {g.name}
                                    </Text>
                                ))
                            )}
                        </View>
                        <View className="mb-3">
                            <Text className="text-secondary font-medium mb-1">Story</Text>
                            <Text className="text-primary">
                                {game.storyline ? (
                                    game.storyline.split('\n\n')[0]
                                ): '-'}
                            </Text>
                        </View>
                        <View className="mb-3">
                            <Text className="text-secondary font-medium mb-1">Summary</Text>
                            <Text className="text-primary">
                                {game.summary ? (
                                    game.summary
                                ): '-'}
                            </Text>
                        </View>
                        <View className="mb-3">
                            <Text className="text-secondary font-medium mb-1">Developers</Text>
                            <Text className="text-primary">
                                {game.involved_companies?.length ? (
                                    game.involved_companies.map(c => c.company.name).join(', ')
                                ): 'N/A'}
                            </Text>
                        </View>
                        <View className="mb-3">
                            <Text className="text-secondary font-medium mb-1">Available Platforms</Text>
                            <Text className="text-primary">
                                {game.platforms?.length ? (
                                    game.platforms.map(p => p.name).join(', ')
                                ): 'N/A'}
                            </Text>
                        </View>
                    </View>

                </ScrollView>
            </View>
        )
    }
    else {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#FDBA74" />
            </View>
        )
    }
}

export default GameDetails;