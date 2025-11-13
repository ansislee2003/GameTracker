import {View, Text, TouchableOpacity} from 'react-native';
import React from "react";
import {Image} from "expo-image";
import StarIcon from '@/assets/icons/star.svg';
import {Link} from "expo-router";

interface Props {
    id: number;
    cover: {
        id: number;
        url: string;
    };
    name: string;
    total_rating: number;
    total_rating_count: number;
}

const GameCard = ({ id, cover, name, total_rating, total_rating_count }: Props) => {
    return (
        <Link href={`/games/${id}`} asChild>
            <TouchableOpacity>
                <View className="w-[132px]">
                    <Image
                        source={cover ? { uri: `https:${cover.url.replace('t_thumb', 't_cover_big')}`}
                                : require('@/assets/images/image-not-found.png')}
                        className="rounded-lg"
                        style={{ width: 132, height: 186, resizeMode: 'cover', borderRadius: 2 }}
                    />
                    <Text
                        className="text-primary min-h-[30]"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {name}
                    </Text>
                    <View className="flex-row items-center">
                        <StarIcon width={16} height={16} color="#FFD700"/>
                        <Text className="text-primary ml-1">{total_rating ? total_rating.toFixed(1) : 'N/A'}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    )
}

export default GameCard;