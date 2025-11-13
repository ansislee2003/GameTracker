import {Text, Pressable} from 'react-native';
import React from "react";
import {ExternalPathString, Link, LinkProps, RelativePathString, router} from "expo-router";

interface Props {
    className?: string;
    color?: string;
    highlightStyle?: string;
    text: string;
    route: LinkProps["href"];
}

const LinkText = ({ className, color="text-primary", highlightStyle="text-secondary-100", text, route }: Props) => {
    return (
        <Pressable
            onPress={() => {router.replace(route)}}
        >
            {({pressed}) => (
                <Text
                    className={`${className} ${pressed ? highlightStyle : color}`}
                >
                    {text}
                </Text>
            )}
        </Pressable>
    )
}

export default LinkText;