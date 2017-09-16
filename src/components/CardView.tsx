import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { Need } from '../API/API'
import { Separator } from '../components/Separator'
import FAIcon from 'react-native-vector-icons/FontAwesome';

import Communications from 'react-native-communications';
import { Linking, Platform } from "react-native";

import { TitleText, PlainText, ButtonText, Colors, dropShadowStyles } from '../constants'

import _ from 'lodash';

interface Props {
    need?: Need
}
interface State { }

export class CardView extends Component<Props, State> {
    constructor(props) {
        super(props)
    }

    onPressDirections = () => {
        const { need } = this.props
        if (!need.latitude || !need.longitude) {
            return false
        }
        let url = this.directionsURL(need.latitude, need.longitude)
        Linking.openURL(url).catch(err =>
            console.error("An error occurred", err)
        );
    }

    directionsURL = (latitude: number, longitude: number) => {
        let provider = Platform.OS
        let link = {
            android: `http://maps.google.com/maps?saddr&daddr=${latitude},${longitude}`,
            ios: `http://maps.apple.com/?saddr=&daddr=${latitude},${longitude}`
        };

        return link[provider];
    }

    renderCategories() {
        const categories = _.chain(this.props.need.categories).values().flatten().compact().value()
        if (categories.length === 0) {
            return 'N/A'
        }

        return _.reduce(categories, (result, value, index) => {
            if (index === (categories.length - 1)) {
                let andString = categories.length === 1 ? '' : 'and '
                return result + andString + value.toLowerCase() + '.'
            }

            return result + value.toLowerCase() + ', '
        }, 'I need ')
    }

    render() {
        const { need } = this.props;

        return (
            <View style={styles.cardContainer}>
                <Text style={styles.needTitleText}>
                    {need.name}
                </Text>

                <ScrollView style={styles.categoryListContainer}>
                    <Text style={styles.categoryListText}>
                        {this.renderCategories()}
                    </Text>
                </ScrollView>

                <View style={styles.actionButtonsContainer}>
                    <View style={styles.actionButtonsTop}>
                        <TouchableOpacity onPress={this.onPressDirections} activeOpacity={0.6} style={StyleSheet.flatten(styles.actionButtonDirections)}>
                            <FAIcon name="map-marker" style={styles.directionButtonIcon} />
                            <Text style={styles.actionButtonDirectionText}> Directions </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionButtonsBottom}>
                        <TouchableOpacity onPress={() => Communications.phonecall(need.phone, true)} activeOpacity={0.6} style={StyleSheet.flatten([styles.actionButton])}>
                            <Text style={styles.actionButtonText}> Call </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => Communications.text(need.phone)} activeOpacity={0.6} style={{ ...StyleSheet.flatten([styles.actionButton]), borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: Colors.white }}>
                            <Text style={styles.actionButtonText}> Text </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
}

const { width, height } = Dimensions.get('window');
const cardBorderRadius = 16;

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        width: (width - 20),
        marginLeft: 10,
        marginRight: 10,
        height: 200,
        borderRadius: cardBorderRadius,
        backgroundColor: '#FFF',
        ...dropShadowStyles,
    },
    needTitleText: {
        ...TitleText,
        textAlign: 'left',
        width: (width - 65),
        height: 40,
        marginTop: 8,
    },
    categoryListContainer: {
        width: (width - 60),
        height: 60,
    },
    categoryListText: {
        ...PlainText,
        textAlign: 'left',
        paddingTop: 1,
        paddingLeft: 5,
        paddingRight: 5,
        marginRight: 5,
        overflow: 'hidden',
        marginBottom: 4,
    },
    actionButtonsContainer: {
        backgroundColor: 'red',
        height: 90,
        alignContent: 'space-around',
        justifyContent: 'space-between',
        marginTop: 10,
        overflow: 'hidden',
        width: (width - 20),
        borderBottomLeftRadius: cardBorderRadius,
        borderBottomRightRadius: cardBorderRadius,
    },
    actionButtonsTop: {
        borderTopWidth: 0.5,
        borderTopColor: '#F3F3F3',
        height: 45,
    },
    actionButtonsBottom: {
        flex: 1,
        backgroundColor: '#50E3C2',
        flexDirection: 'row',
        height: 45,
        overflow: 'hidden',
        width: (width - 20)
    },
    actionButtonText: {
        ...ButtonText,
        color: 'white',
    },
    actionButtonDirections: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    actionButtonDirectionText: {
        ...ButtonText,
        color: Colors.grey,
    },
    directionButtonIcon: {
        marginRight: 5,
        fontSize: 32,
        color: Colors.grey,
    },
    actionButton: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
});
