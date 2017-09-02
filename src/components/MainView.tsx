import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { API, Need } from '../API/API'
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
        console.log('blag')
        this.setState({ needs: needs })
    }
    render() {
        return (
            <MapView
                style={{ left: 0, right: 0, top: 0, bottom: 0, position: 'absolute' }}
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
        )
    }
}