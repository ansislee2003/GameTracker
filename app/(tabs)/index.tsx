import {ActivityIndicator, FlatList, ScrollView, Text, View} from "react-native";
import {Image} from "expo-image";
import SearchBar from "@/components/SearchBar";
import { useRouter } from "expo-router";
import GameCard from "@/components/GameCard";
import React, { useEffect, useState } from 'react';
import axios from "axios";

const API_BASE_URL = 'https://api-idspf7h7kq-uc.a.run.app';

export default function Index() {
    const router = useRouter();

    const [topGames, setTopGames] = useState([]);
    const [topGamesLoading, setTopGamesLoading] = useState(true);
    const [topGamesError, setTopGamesError] = useState('');

    const [trendingGames, setTrendingGames] = useState([]);
    const [trendingGamesLoading, setTrendingGamesLoading] = useState(true);
    const [trendingGamesError, setTrendingGamesError] = useState('');

    const [topNewGames, setTopNewGames] = useState([]);
    const [topNewGamesLoading, setTopNewGamesLoading] = useState(true);
    const [topNewGamesError, setTopNewGamesError] = useState('');

    useEffect(() => {
        axios.post(`${API_BASE_URL}/getTopGames`)
        .then(response => {
            setTopGames(response.data);
            setTopGamesLoading(false);
        })
        .catch(error => {
            setTopGamesError(error);
        })

        axios.post(`${API_BASE_URL}/getTrendingGames`)
        .then(response => {
            setTrendingGames(response.data);
            setTrendingGamesLoading(false);
        })
        .catch(error => {
            setTrendingGamesError(error);
        })

        axios.post(`${API_BASE_URL}/getTopNewGames`)
        .then(response => {
            setTopNewGames(response.data);
            setTopNewGamesLoading(false);
        })
        .catch(error => {
            setTopNewGamesError(error);
        })
    }, []);

  return (
    <View className="flex-1 justify-center items-center bg-background">
        <ScrollView
            className="flex-1 px-5 w-full"
            showsVerticalScrollIndicator={ true }
            contentContainerStyle={{
                minHeight: "100%",
                alignItems: "center"
            }}
        >
            <Image source={require('@/assets/images/logo.png')}
                   className="mt-10"
                   style={{ width: 50, height: 50, marginTop: 50 }}
            />

            <View className="mt-5">
                <SearchBar
                    onPress={() => router.push("/search")}
                    placeholder="Search"
                    editable={false}
                />
            </View>

            <View className="mt-5 w-full">
                <Text className="text-primary text-lg font-medium">Trending Games</Text>
                {!trendingGamesLoading ? (
                    <FlatList
                        className="mt-2 pb-4"
                        data={ trendingGames }
                        renderItem={({ item }) => (
                            <GameCard
                                {...item}
                            />
                        )}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View className="w-4" />}
                    />
                ) : (
                    <View className="flex-1 my-10 py-10 align-middle">
                        <ActivityIndicator size="large" color="#FDBA74" />
                    </View>
                )}

                <Text className="text-primary text-lg font-medium">Best New Games</Text>
                {!topNewGamesLoading ? (
                    <FlatList
                        className="mt-2 pb-4"
                        data={ topNewGames }
                        renderItem={({ item }) => (
                            <GameCard
                                {...item}
                            />
                        )}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View className="w-4" />}
                    />
                ) : (
                <View className="flex-1 my-10 py-10 align-middle">
                    <ActivityIndicator size="large" color="#FDBA74" />
                </View>
                )}

                <Text className="text-primary text-lg font-medium">Top Rated Games</Text>
                {!topGamesLoading ? (
                    <FlatList
                        className="mt-2 pb-4"
                        data={ topGames }
                        renderItem={({ item }) => (
                            <GameCard
                                {...item}
                            />
                        )}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View className="w-4" />}
                    />
                ) : (
                    <View className="flex-1 my-10 py-10 align-middle">
                        <ActivityIndicator size="large" color="#FDBA74" />
                    </View>
                )}
            </View>

        </ScrollView>
    </View>
  );
}
