import React, { Component } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Need } from '../API/API'
import { Separator } from '../components/Separator'
import FAIcon from 'react-native-vector-icons/FontAwesome';

interface Props {
    need?: Need
}
interface State { }

export class CalloutView extends Component<Props, State> {
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
            <View style={styles.calloutContainer}>
                <Text style={{
                    textAlign: 'left',
                    marginTop: 10,
                    marginBottom: 10,
                    marginLeft: 10,
                    fontSize: 16,
                    fontWeight: 'bold'
                }}>{need.category}</Text>

                <Text style={{
                    textAlign: 'left',
                    marginTop: 10,
                    marginBottom: 10,
                    marginLeft: 10
                }}>{need.description}</Text>

                <View style={styles.actionButtonsContainer}>
                    <View style={styles.actionButtonsTop}>
                        <TouchableOpacity activeOpacity={0.9} style={StyleSheet.flatten(styles.actionButtonDirections)}>
                            <FAIcon name="map-marker" size={15} style={styles.directionButtonIcon} />
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

const styles = StyleSheet.create({
    calloutContainer: {
        flex: 1,
        justifyContent: 'space-around',
    },

    actionButtonsContainer: {
        height: 50,
        backgroundColor: '#50E3C2',
        alignContent: 'space-around',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    actionButtonsTop: {
        height: 25,
    },

    actionButtonDirections: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderTopWidth: 0.5,
        borderTopColor: '#A2AEB6',
    },

    actionButtonDirectionText: {
        color: '#A2AEB6',
        fontWeight: 'bold',
    },

    directionButtonIcon: {
        color: "#A2AEB6",
        marginRight: 5
    },

    actionButtonsBottom: {
        flex: 1,
        flexDirection: 'row',
        height: 20
    },

    actionButton: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },

    actionButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
});
