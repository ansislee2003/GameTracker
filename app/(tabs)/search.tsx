import {
    Text,
    View,
    ScrollView,
    FlatList,
    TextInput,
    ActivityIndicator,
    Dimensions,
    TouchableWithoutFeedback, Keyboard, ImageBackground,
} from "react-native";
import SearchBar from "@/components/SearchBar";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {router, useFocusEffect} from "expo-router";
import axios from "axios";
import GameCard from "@/components/GameCard";
import {Icon} from "react-native-paper/src";
import Animated, {FadeInDown, FadeOutUp} from "react-native-reanimated";

const API_BASE_URL = 'https://api-idspf7h7kq-uc.a.run.app';

export default function Index() {
    const [searchText, setSearchText] = useState('');
    const [searchGames, setSearchGames] = useState([]);
    const [searchGamesLoading, setSearchGamesLoading] = useState(false);
    const [isEmptySearch, setIsEmptySearch] = useState(false);
    const searchOffset = useRef(0);
    const currSearchText = useRef("");

    const getGamesByName = (searchTerm: string, isSearch: boolean, searchId: number) => {
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
            // skip appending results if this search is not the lastest search
            if (searchId != latestSearchId.current) { return; }

            if (isSearch) {     // for searching with new search term
                if (response.data.length == 0) {
                    setIsEmptySearch(true);
                    setHasLoadMore(false);
                }
                else if (response.data.length < 10) {
                    // games are fetched in batches of 10, less than full batch means end of results
                    setHasLoadMore(false);
                }
                setSearchGames(response.data);
                searchOffset.current = response.data.length;
            }
            else {      // for load more, appends to searchGames list
                if (response.data.length < 10) {
                    // games are fetched in batches of 10, less than full batch means end of results
                    setHasLoadMore(false);
                }
                setSearchGames(prev => prev.concat(response.data));
                searchOffset.current += response.data.length;
            }
            setSearchGamesLoading(false);
            setLoadMoreLoading(false);
        })
        .catch(error => {
            setSearchGamesLoading(false);
            setLoadMoreLoading(false);
            console.log(error.message);
        })
    }

    const latestSearchId = useRef(0);
    // trigger search with debounce when searchText updates
    useEffect(() => {
        latestSearchId.current++;

        const searchTimer = setTimeout(() => {
            setIsEmptySearch(false);
            setSearchGames([]);
            setHasLoadMore(true);
            searchOffset.current = 0;

            // trigger searchGames
            if (searchText) {
                currSearchText.current = searchText;
                setSearchGamesLoading(true);
                getGamesByName(searchText, true, latestSearchId.current);
            }
        }, 1000)

        // clean up previous stale timer
        return () => { clearTimeout(searchTimer); }
    }, [searchText]);

    const loadMoreThreshold = 100;
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);
    const [hasLoadMore, setHasLoadMore] = useState(true);
    useEffect(() => {   // load more triggered
        latestSearchId.current++;

        const searchTimer = setTimeout(() => {
            if (loadMoreLoading) {
                // trigger load more
                if (searchText) {
                    getGamesByName(searchText, false, latestSearchId.current);
                }
            }
        }, 1000)

        // clean up previous stale timer
        return () => { clearTimeout(searchTimer); }
    }, [loadMoreLoading]);

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
        <ImageBackground
            source={require('@/assets/images/background.png')}
            className="flex-1"
            resizeMode="cover"
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View className="flex-1 justify-center items-center" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <View className="flex-1 w-full mt-10 pt-10 px-5">
                        <SearchBar
                            ref={searchBarRef}
                            searchText={searchText}
                            placeholder="Search"
                            onChangeText={setSearchText}
                        />

                        <Text className="text-primary text-lg font-medium py-3">Searching for: {searchText?searchText:'-'}</Text>

                        <View style={{ height: adjustedHeight }}>
                            {(searchGames.length > 0 || searchGamesLoading) ? (
                                <Animated.View
                                    className="mt-3 w-full"
                                    entering={FadeInDown.duration(150)}
                                    exiting={FadeOutUp.duration(150)}
                                >
                                    <FlatList
                                        data={searchGames}
                                        renderItem={({item}) => (
                                            <GameCard
                                                {...item}
                                            />
                                        )}
                                        keyExtractor={(item) => item.id.toString()}
                                        scrollEnabled={true}
                                        onEndReached={
                                            () => {
                                                if (hasLoadMore && searchGames.length < loadMoreThreshold && searchGames.length > 0) {
                                                    setLoadMoreLoading(true);
                                                }
                                            }
                                        }
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
                                            (hasLoadMore && (searchGames.length > 0 || searchGamesLoading)) ? (
                                                <ActivityIndicator style={{paddingTop: 20}} size="large" color="#FDBA74"/>
                                            ) : (!hasLoadMore) ? (
                                                <View className="w-full mt-5 justify-center items-center text-lg">
                                                    <Text style={{ color: "#FDBA74" }}> End of results </Text>
                                                </View>
                                            ) : null
                                        }
                                    />
                                </Animated.View>
                            ) : isEmptySearch && (
                                <View key="no-results" className="flex-1 w-full items-center justify-center">
                                    <Icon size={100} source="file-search-outline"/>
                                    <Text className="text-primary text-lg mt-3">{`No results found for "${currSearchText.current}"`}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ImageBackground>
    );
}