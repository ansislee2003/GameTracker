import {ImageBackground, Text, View} from "react-native";
import {auth} from "@/FirebaseConfig";

export default function Index() {
    const user = auth.currentUser;

    return (
        <ImageBackground
            source={require('@/assets/images/background.png')}
            className="flex-1"
            resizeMode="cover"
        >
            <View className="flex-1 justify-center items-center" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                {user ? (
                    <Text className="text-primary">Email verfied</Text>
                ) : (
                    <Text className="text-primary">Unverified</Text>
                )}
            </View>
        </ImageBackground>
    );
}