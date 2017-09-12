import React, { Component } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { Need } from '../API/API'
import { Separator } from '../components/Separator'
import FAIcon from 'react-native-vector-icons/FontAwesome';

interface Props {
    need?: Need
}
interface State { }

export class CardView extends Component<Props, State> {
    constructor(props) {
        super(props)
    }

    renderItem = ({ item, index }: { item: string, index: number }) => {
        return (
            <View style={{
                height: 40,
                justifyContent: 'center'
            }}>
                <Text style={{ marginLeft: 10 }}>{item}</Text>
            </View>
        )
    }

    keyExtractor = (_: string, index: number): string => {
        return `${index}`
    }

    render() {
        const {need} = this.props;
        
        return (
            <View style={styles.cardContainer}>
                <Text style={styles.needTitleText}>
                    {need.name}
                </Text>

                <Text style={styles.needDescriptionText}>{need.description}</Text>

                <View style={styles.actionButtonsContainer}>
                    <View style={styles.actionButtonsTop}>
                        <TouchableOpacity activeOpacity={0.9} style={StyleSheet.flatten(styles.actionButtonDirections)}>
                            <FAIcon name="map-marker" size={24} style={styles.directionButtonIcon} />
                            <Text style={styles.actionButtonDirectionText}> Directions </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionButtonsBottom}>
                        <TouchableOpacity activeOpacity={0.9} style={StyleSheet.flatten([styles.actionButton])}>
                            <Text style={styles.actionButtonText}> Call </Text>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.9} style={StyleSheet.flatten([styles.actionButton])}>
                            <Text style={styles.actionButtonText}> Text </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        justifyContent: 'space-between',
        width: (width - 20),
        marginLeft: 10,
        marginRight: 10,
        height: 300,
        borderRadius: 35,
        backgroundColor: '#FFF',
    },

    needTitleText: {
        textAlign: 'left',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 15,
        fontSize: 16,
        fontWeight: 'bold',
        color: "#505E65",
    },

    needDescriptionText: {
        textAlign: 'left',
        height: 150,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 15,
        color: "#505E65",
    },

    actionButtonsContainer: {
        backgroundColor: 'red',
        height: 80,
        alignContent: 'space-around',
        justifyContent: 'space-between',
        marginTop: 10,
        overflow: 'hidden',
        width: (width - 20),
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },

    actionButtonsTop: {
        borderTopWidth: 0.5,
        borderTopColor: '#A2AEB6',
        height: 40,
    },

    actionButtonsBottom: {
        flex: 1,
        backgroundColor: '#50E3C2',
        flexDirection: 'row',
        height: 40,
        overflow: 'hidden',
        width: (width - 20)
    },

    actionButtonText: {
        fontSize: 24,
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
        fontSize: 24,
        color: '#A2AEB6',
    },

    directionButtonIcon: {
        color: "#A2AEB6",
        marginRight: 5
    },

    actionButton: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
});
