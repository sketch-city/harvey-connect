import React, { Component } from 'react';
import { View, Text, FlatList, Button, Dimensions } from 'react-native';
import { API, Need } from '../API/API'
import { CalloutView } from './CalloutView'
import { BlurView, VibrancyView } from 'react-native-blur'
var MapView = require('react-native-maps')

interface Props {
}

interface State {
    needs: Need[]
}
export class MainView extends Component<Props, State> {
    intervalId: number;

    constructor(props) {
        super(props);
        this.state = {
            needs: []
        }
    }

    componentDidMount() {
        this.getNeeds()
    }

    async getNeeds() {
        let needs = await API.getNeeds()
        if (needs !== undefined || needs !== null) {
            this.setState({ needs: needs })
        }
    }

    renderItem = ({ item, index }: { item: string, index: number }) => {
        let { width, height } = Dimensions.get('window')
        return (
            <BlurView style={{
                width: width - 20,
                height: 200,
                marginRight: 10,
                marginLeft: 10,
                borderRadius: 6
            }}
                blurType={'light'}>
                <CalloutView />
            </BlurView >

        )
    }

    keyExtractor = (_: string, index: number): string => {
        return `${index}`
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: 29.7630556,
                        longitude: -95.3630556,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    showsUserLocation={true}
                >
                    {this.state.needs.map(marker => (
                        <MapView.Marker
                            pinColor={marker.areVolunteersNeeded ? 'red' : 'blue'}
                            coordinate={{
                                latitude: marker.latitude,
                                longitude: marker.longitude
                            }}
                            title={marker.updatedBy}
                            description={marker.tellUsAboutSupplyNeeds}
                            key={marker.timestamp}
                        >
                        </MapView.Marker>
                    ))}
                </MapView>
                <View style={{
                    left: 0,
                    right: 0,
                    top: 400,
                    bottom: 10,
                    position: 'absolute',
                }}>
                    <FlatList data={['Wheelbarrow', 'Labor', 'Labor']}
                        renderItem={this.renderItem}
                        keyExtractor={this.keyExtractor}
                        horizontal={true}
                        pagingEnabled={true}

                    />
                </View>
            </View>
        )
    }
}