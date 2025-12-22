import {View, Text, ScrollView, ActivityIndicator, ImageBackground} from 'react-native';
import React, {useEffect, useState} from "react";
import {useLocalSearchParams} from "expo-router";
import StarIcon from "@/assets/icons/star.svg";
import Animated from "react-native-reanimated";
import api from "@/api"
import {Button, IconButton, Modal, Portal} from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import {auth, db} from "@/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const GameDetails = () => {
    const { id } = useLocalSearchParams();

    const [game, setGame] = useState([]);
    const [savedGame, setSavedGame] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const showModal = () => {
        setScore(null);
        setProgress(null);
        setModalVisible(true);
    }
    const hideModal = () => setModalVisible(false);

    // game score dropdown
    const [openScore, setOpenScore] = useState(false);
    const [score, setScore] = useState(null);
    const [scoreOptions, setScoreOptions] = useState([
        { label: '-', value: -1 },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
        { label: '5', value: 5 },
        { label: '6', value: 6 },
        { label: '7', value: 7 },
        { label: '8', value: 8 },
        { label: '9', value: 9 },
        { label: '10', value: 10 }
    ]);

    // game progress dropdown
    const [openProgress, setOpenProgress] = useState(false);
    const [progress, setProgress] = useState(null);
    const [progressOptions, setProgressOptions] = useState([
        { label: 'Planned on playing', value: 'planned_on_playing' },
        { label: 'Actively playing', value: 'actively_playing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Dropped', value: 'dropped' },
        { label: 'Retired', value: 'retired' }
    ]);

    useEffect(() => {
        api.post('/getGameById', {"gameID": id},
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        .then(response => {
            setGame(response.data);
            setLoading(false);
        })
        .catch(error => {
            setError(error);
        })

        if (auth.currentUser){
            const gameRef = doc(db, 'savedGames', auth.currentUser.uid, 'games', id);
            getDoc(gameRef)
                .then(snapshot => {
                    if (snapshot.exists()) {
                        setSavedGame(true);
                    }
                })
        }
    }, []);

    if (!loading) {
        return (
            <ImageBackground
                source={require('@/assets/images/background.png')}
                className="flex-1"
                resizeMode="cover"
            >
            <View className="flex-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <Portal>
                    <Modal
                        contentContainerStyle={{
                            alignSelf: "center",
                            width: "80%",
                            backgroundColor: '#37404c',
                            padding: 20
                        }}
                        visible={modalVisible}
                        onDismiss={hideModal}
                    >
                        <Text className="text-primary text-lg font-medium">Add to game list</Text>
                        <Text className="text-primary text-lg font-medium mt-4 mb-2">Score:</Text>
                        <DropDownPicker
                            open={openScore}
                            value={score}
                            items={scoreOptions}
                            setOpen={setOpenScore}
                            setValue={setScore}
                            setItems={setScoreOptions}
                            zIndex={3000}
                            zIndexInverse={1000}
                            placeholder="-"
                        />
                        <Text className="text-primary text-lg font-medium mt-4 mb-2">Progress:</Text>
                        <DropDownPicker
                            open={openProgress}
                            value={progress}
                            items={progressOptions}
                            setOpen={setOpenProgress}
                            setValue={setProgress}
                            setItems={setProgressOptions}
                            zIndex={2000}
                            zIndexInverse={2000}
                            placeholder="-"
                        />
                        <Button
                            className="mt-5 text-primary"
                            mode="outlined"
                            onPress={() => {
                                // call saveGameById api
                                api.post('/game/saveGameByID',{
                                    'gameID': id,
                                    'score': score,
                                    'progress': progress
                                },
                                {
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                })
                                    .then(response => {
                                        hideModal();
                                    })
                                    .catch(error => {
                                        console.log(error.response.data.error);
                                    })
                            }}
                        >
                            Save
                        </Button>
                    </Modal>
                </Portal>
                <ScrollView>
                    <Animated.Image
                        className="w-[300px] h-[300px]"
                        source={game.cover ? { uri: `https:${game.cover.url.replace('t_thumb', 't_original')}`}
                                : require('@/assets/images/image-not-found.png')}
                        style={{ width: "100%", height: 520, resizeMode: 'cover', borderRadius: 2 }}
                    />

                    <View className="py-3.5 px-3.5">
                        <View className="flex-row justify-between">
                            <Text className="text-primary text-xl font-medium mb-1 flex-1">{game.name || "-"}</Text>
                            <IconButton
                                icon={savedGame ? "bookmark" : "bookmark-outline"}
                                size={30}
                                style={{margin: 0, padding: 0, width: 38, height: 38}}
                                onPress={() => {
                                    showModal();
                                }}
                            />
                        </View>
                        <Text className="text-primary mb-1">
                            {game.first_release_date ? new Date(game.first_release_date * 1000).toLocaleDateString()
                            : '-'}
                        </Text>
                        <View className="flex-row items-center mb-2">
                            <StarIcon width={16} height={16} color="#FFD700"/>
                            {game.total_rating ? (
                                    <>
                                        <Text className="text-primary ml-1 mr-2">{game.total_rating.toFixed(1)} / 100</Text>
                                        <Text className="text-primary">({game.total_rating_count} votes)</Text>
                                    </>
                            ): (
                                <Text className="text-primary">N/A</Text>
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
                            <Text className="text-primary font-medium mb-1">Story</Text>
                            <Text className="text-primary">
                                {game.storyline ? (
                                    game.storyline.split('\n\n')[0]
                                ): '-'}
                            </Text>
                        </View>
                        <View className="mb-3">
                            <Text className="text-primary font-medium mb-1">Summary</Text>
                            <Text className="text-primary">
                                {game.summary ? (
                                    game.summary
                                ): '-'}
                            </Text>
                        </View>
                        <View className="mb-3">
                            <Text className="text-primary font-medium mb-1">Developers</Text>
                            <Text className="text-primary">
                                {game.involved_companies?.length ? (
                                    game.involved_companies.map(c => c.company.name).join(', ')
                                ): 'N/A'}
                            </Text>
                        </View>
                        <View className="mb-3">
                            <Text className="text-primary font-medium mb-1">Available Platforms</Text>
                            <Text className="text-primary">
                                {game.platforms?.length ? (
                                    game.platforms.map(p => p.name).join(', ')
                                ): 'N/A'}
                            </Text>
                        </View>
                    </View>

                </ScrollView>
            </View>
            </ImageBackground>
        )
    }
    else {
        return (
            <ImageBackground
                source={require('@/assets/images/background.png')}
                className="flex-1"
                resizeMode="cover"
            >
                <View className="flex-1 items-center justify-center" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <ActivityIndicator size="large" color="#FDBA74" />
                </View>
            </ImageBackground>
        )
    }
}

export default GameDetails;