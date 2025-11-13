import {
    Text,
    View,
    ScrollView,
    FlatList,
    TextInput,
    ActivityIndicator,
    Dimensions,
    TouchableWithoutFeedback, Keyboard
} from "react-native";
import SearchBar from "@/components/SearchBar";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {router, useFocusEffect} from "expo-router";
import axios from "axios";
import GameCard from "@/components/GameCard";

const API_BASE_URL = 'https://api-idspf7h7kq-uc.a.run.app';

export default function Index() {
    const [searchText, setSearchText] = useState('');
    const [searchGames, setSearchGames] = useState([]);
    const [searchGamesLoading, setSearchGamesLoading] = useState(false);
    const searchOffset = useRef(0);
    const searchDebounceTimer = useRef<number | null>(null);

    const getGamesByName = (searchTerm: string, isSearch: boolean) => {
        axios.post(`${API_BASE_URL}/getGamesByName`,
            {
                "searchTerm": searchTerm,
                "searchOffset": searchOffset.current,
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        .then(response => {
            console.log(response.data.map(g => g.name));
            if (isSearch) {
                setSearchGames(response.data);
                searchOffset.current = response.data.length;
                console.log("searchOffset",searchOffset.current);
            }
            else {
                setSearchGames(prev => prev.concat(response.data));
                searchOffset.current += response.data.length;
            }
            setSearchGamesLoading(false);
        })
        .catch(error => {
            setSearchGamesLoading(false);
            console.log(error.message);
        })
    }

    const onChangeText = (newText: string) => {
        setSearchText(newText);

        // prevent displaying games from old query after hiding searched games list
        if (newText === "") {
            setSearchGames([]);
            searchOffset.current = 0;
        }

        if (searchDebounceTimer.current) {
            clearTimeout(searchDebounceTimer.current);
        }

        searchDebounceTimer.current = setTimeout(() => {
            setSearchGames([]);
            searchOffset.current = 0;
            setSearchGamesLoading(true);
            getGamesByName(newText, true);
        }, 1000)
    }

    const loadMoreThreshold = 100;
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);
    const loadDebounceTimer = useRef<number | null>(null);
    const loadMoreGames = () => {
        if (!searchGamesLoading && searchGames.length > 0 && searchGames.length < loadMoreThreshold) {
            console.log("load more triggered")
            console.log("searchOffset",searchOffset.current);
            setSearchGamesLoading(true);
            getGamesByName(searchText, false);
        }
    }

    // focus on load
    const searchBarRef = useRef<TextInput>(null);
    useFocusEffect(
        useCallback(() => {
            if (searchText.length == 0) {
                searchBarRef.current?.focus();
            }
            return () => {
                searchBarRef.current?.blur?.();
                setSearchText('');
                setSearchGames([]);
                searchOffset.current = 0;
            };
        }, [])
    );

    const screenHeight = Dimensions.get('window').height;
    const adjustedHeight = screenHeight - 250;

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="flex-1 justify-center items-center bg-background">
                <View className="flex-1 w-full mt-10 pt-10 px-5">
                    <SearchBar
                        ref={searchBarRef}
                        searchText={searchText}
                        placeholder="Search"
                        onChangeText={ onChangeText }
                    />

                    {searchText && (
                        <View style={{ height: adjustedHeight }}>
                            <Text className="text-primary text-lg font-medium py-3">Searching for: {searchText}</Text>
                            <View className="mt-3 w-full">
                                <FlatList
                                data={searchGames}
                                renderItem={({item}) => (
                                    <GameCard
                                        {...item}
                                    />
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                scrollEnabled={true}
                                onEndReached={loadMoreGames}
                                onEndReachedThreshold={0.1}
                                numColumns={2}
                                contentContainerStyle={{justifyContent: 'center'}}
                                columnWrapperStyle={{
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 25,
                                    gap: 15
                                }}
                                ItemSeparatorComponent={() => <View style={{height: 10}}/>}
                                ListFooterComponent={
                                    searchGamesLoading ? (
                                        <ActivityIndicator style={{ paddingTop: 20 }} size="large" color="#FDBA74"/>
                                    ): null
                                }
                            />
                            </View>
                        </View>
                     )}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}