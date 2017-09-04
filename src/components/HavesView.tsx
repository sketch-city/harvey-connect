import React, { Component } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Modal
} from 'react-native';
import MapView from 'react-native-maps'
import { TextCell } from './TextCell'
import { ButtonCell } from './ButtonCell'
import { CategoryList } from './CategoryList'

interface State {
    currentLocation: {
        latitude: number,
        longitude: number
    },
    modalVisible: boolean,
    selectedCategories: {}
}
export class HavesView extends Component<{}, State> {

    constructor(props) {
        super(props)
        this.state = {
            currentLocation: null,
            modalVisible: false,
            selectedCategories: []
        }
    }

    renderItem = ({ item, index }: { item: string, index: number }) => {
        return (
            <View style={{
                height: 45,
                marginRight: 10,
                marginLeft: 10,
                justifyContent: 'center'
            }}
            >
                {this.viewForCell(item)}
            </View >

        )
    }

    viewForCell = (item: string) => {
        switch (item) {
            case 'Phone':
                return <TextCell placeholder={'Phone Number'}
                    keyboardType={'phone-pad'} />
            case 'Name':
                return <TextCell placeholder={item} />
            case 'Category':
                return <ButtonCell buttonTitle={'Select Category'}
                    value={`${Object.keys(this.state.selectedCategories).length} Selected`}
                    onButtonPress={() => this.setState({ modalVisible: true })} />

            default:
                return <TextCell placeholder={item} />
        }
    }
    keyExtractor = (_: string, index: number): string => {
        return `${index}`
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition((position) => {
            this.setState({
                currentLocation: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }
            })
        }, (error) => {
        }, {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000
            })
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <Modal visible={this.state.modalVisible}
                    animationType={'slide'}>
                    <CategoryList
                        selectedCategories={this.state.selectedCategories}
                        closeButtonTapped={(items) => this.setState({ modalVisible: false, selectedCategories: items })}
                        itemSelected={(item) => this.setState({
                            modalVisible: false,
                        })} />
                </Modal>
                <MapView
                    style={{ flex: 2 }}
                    initialRegion={{
                        latitude: 29.7630556,
                        longitude: -95.3630556,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    showsUserLocation={true}

                >
                    {/* {this.state.needs.map(marker => (
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
            ))} */}
                </MapView>
                <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }}
                    contentContainerStyle={{ flex: 1, backgroundColor: 'white' }}
                    behavior={'position'}>
                    < View style={{
                        height: 45,
                        margin: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                        <TouchableOpacity style={{
                            height: 45,
                            flex: 1,
                            marginRight: 10,
                            backgroundColor: 'green',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 7
                        }}>
                            <Text style={{ color: 'white' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            height: 45,
                            flex: 1,
                            marginLeft: 10,
                            backgroundColor: 'green',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 7
                        }}>
                            <Text style={{ color: 'white' }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <FlatList data={['Phone', 'Category', 'Description', 'Name']}
                            renderItem={this.renderItem}
                            keyExtractor={this.keyExtractor}
                            extraData={this.state.selectedCategories}
                        />
                    </View>

                </KeyboardAvoidingView>
            </View>
        )
    }
}
