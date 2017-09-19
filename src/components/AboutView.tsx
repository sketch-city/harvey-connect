import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Image } from 'react-native';
import { Need } from '../API/API'
import { Separator } from '../components/Separator'
import FAIcon from 'react-native-vector-icons/FontAwesome';

import Communications from 'react-native-communications';
import { Linking, Platform, Alert } from "react-native";

import { TitleText, PlainText, ButtonText, Colors, dropShadowStyles } from '../constants';
import { strings } from '../localization/Strings';

import { Answers } from 'react-native-fabric';


interface Props {
}
interface State { }

export class AboutView extends Component<Props, State> {
    constructor(props) {
        super(props)
    }

    render() {
        const { width, height } = Dimensions.get('window');
        return (
            <Image source={require('./../images/aboutImage.png')} style={{ width: width, height: height }} />
        )
    }
}