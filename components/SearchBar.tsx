import {View, Text, TextInput} from 'react-native';
import React, {RefObject} from "react";
import { icons } from '@/assets/icons';
import {useState} from "react";

interface Props {
    ref?: RefObject<TextInput | null>;
    searchText: string;
    placeholder: string;
    onPress?: () => void;
    onChangeText?: (newText: string) => void;
    onSubmitEditing?: () => void;
    editable?: boolean;
}

const SearchBar = ({ref, searchText, placeholder, onPress, onChangeText, onSubmitEditing, editable=true}: Props) => {
    return (
        <View className="flex-row w-full items-center bg-primary rounded-full px-4 py-3">
            <icons.search color="#999999" width={17} height={17}/>
            <TextInput
                ref={ref}
                className="flex-1 text-white ml-3"
                style={{ fontSize: 17, includeFontPadding: false }}
                placeholder= { placeholder }
                value={ searchText }
                onPress={ onPress }
                onChangeText={ onChangeText }
                onSubmitEditing={ onSubmitEditing }
                placeholderTextColor="#999999"
                editable={ editable }
            />
        </View>
    )
}

export default SearchBar;