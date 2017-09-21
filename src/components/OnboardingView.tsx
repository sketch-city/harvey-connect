import React, { Component } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    AsyncStorage
} from 'react-native';

import { Colors, styles } from '../constants';
import { strings } from '../localization/Strings';

interface Props {
    cancelTapped: () => void
}
interface State { }

const localStyles = StyleSheet.create({
    infoLabel: {
        flex: 1,
        color: Colors.needText,
        fontWeight: '600',
        backgroundColor: 'rgba(0,0,0,0)',
        alignSelf: 'center',
        marginHorizontal: 40,
        textAlign: 'center'
    }
});

export class OnboardingView extends Component<Props, State> {
    constructor(props) {
        super(props)
    }

    render() {
        const { width, height } = Dimensions.get('window');
        return (
            <View style={{
                ...StyleSheet.absoluteFillObject,
                position: 'absolute',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'center'
            }}>
                <Image source={require('./../images/logo.png')} resizeMode={'center'} style={{ flex: 1 }}/>
                <View style={{
                    flex: 1,
                    height: 1,
                    marginHorizontal: 10,
                    backgroundColor: Colors.separatorColor
                }}/>
                <Image source={require('./../images/I_need.png')} style={{ flex: 1, width: width }} resizeMode={'center'} />
                <Text style={localStyles.infoLabel}>
                    If you need help recovering from a disaster,{'\n'} tap 'I NEED' to register your request.
                </Text>
                <Image source={require('./../images/card.png')} style={{ flex: 1, width: width }} resizeMode={'center'} />
                <View style={{ flex: 1, ...StyleSheet.flatten([styles.actionButtonContainer])}}>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={this.props.cancelTapped}
                        style={StyleSheet.flatten([styles.actionButton, styles.actionButtonFilter])}>
                        <Text style={styles.actionButtonText}>{strings.doneAction.toLocaleUpperCase()}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}