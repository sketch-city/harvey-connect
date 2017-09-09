import React, { Component } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Alert
} from 'react-native';
import MapView from 'react-native-maps'
import { TextCell } from './TextCell'
import { ButtonCell } from './ButtonCell'
import { CategoryList } from './CategoryList'
import { API, CreateMarker } from './../API/API'
import { UUIDHelper } from './../API/UUIDHelper'
import { Separator } from "./Separator";

type LatLng = {
    latitude: number,
    longitude: number,
}

type Point = {
    x: number,
    y: number,
}

export const enum MarkerValue {
    Name = 1,
    Phone,
    Address,
    Description,
    Email
}

export const enum MarkerType {
    Have = 1,
    Need
}
interface Props {
    cancelTapped: () => void,
    markerType: MarkerType

}
interface State {
    currentLocation: {
        latitude: number,
        longitude: number
    },
    pinLocation: {
        latitude: number,
        longitude: number
    },
    modalVisible: boolean,
    selectedCategories: {},
    phone: string,
    name: string,
    address: string
    email?: string,
    description: string

}
export class HavesView extends Component<Props, State> {

    constructor(props) {
        super(props)
        this.state = {
            pinLocation: null,
            currentLocation: null,
            modalVisible: false,
            selectedCategories: [],
            phone: '',
            description: '',
            email: '',
            address: '',
            name: ''
        }
    }

    renderItem = ({ item, index }: { item: MarkerValue, index: number }) => {
        let height = item === MarkerValue.Description ? 100 : 45
        return (
            <View style={{
                height: height,
                marginRight: 10,
                marginLeft: 10,
                justifyContent: 'center'
            }}
            >
                {this.viewForCell(item)}
            </View >

        )
    }

    updateState = (value: string, marker: MarkerValue) => {
        switch (marker) {
            case MarkerValue.Address: this.setState({ address: value })
                break;
            case MarkerValue.Name: this.setState({ name: value })
                break;
            case MarkerValue.Phone: this.setState({ phone: value })
                break;
            case MarkerValue.Description: this.setState({ description: value })
                break;
            case MarkerValue.Email: this.setState({ email: value })
                break;
        }
    }

    viewForCell = (item: MarkerValue) => {
        switch (item) {
            case MarkerValue.Phone:
                return <TextCell placeholder={'Phone Number'}
                    keyboardType={'phone-pad'}
                    markerValue={MarkerValue.Phone}
                    textChanged={this.updateState} />
            case MarkerValue.Name:
                return <TextCell placeholder={'Name'}
                    markerValue={MarkerValue.Name}
                    textChanged={this.updateState} />
            // case MarkerValue.:
            //     return <ButtonCell buttonTitle={'Select Category'}
            //         value={`${Object.keys(this.state.selectedCategories).length} Selected`}
            //         onButtonPress={() => this.setState({ modalVisible: true })} />
            case MarkerValue.Email:
                return <TextCell placeholder={'Email'}
                    markerValue={MarkerValue.Email}
                    textChanged={this.updateState} />
            case MarkerValue.Description:
                let placeholder = this.props.markerType === MarkerType.Need ? 'I Need ...' : 'I Have ...'
                return <TextCell placeholder={placeholder}
                    markerValue={MarkerValue.Description}
                    textChanged={this.updateState} />
            case MarkerValue.Address:
                return <TextCell placeholder={'Address'}
                    markerValue={MarkerValue.Address}
                    textChanged={this.updateState} />

        }
    }

    keyExtractor = (_: MarkerValue, index: number): string => {
        return `${index}`
    }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition((position) => {
            this.setState({
                currentLocation: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }, pinLocation: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }
            })
        }, (error) => {
            console.log(error)
        }, {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000
            })
    }

    createNeed = async () => {
        let createMarker = new CreateMarker()
        createMarker.name = this.state.name
        let type = this.props.markerType === MarkerType.Need ? 'need' : 'have'
        createMarker.marker_type = type
        createMarker.address = this.state.address
        createMarker.description = this.state.description
        createMarker.phone = this.state.phone
        createMarker.latitude = this.state.pinLocation.latitude
        createMarker.longitude = this.state.pinLocation.longitude
        createMarker.categories = { labor: null }

        try {
            let result = await API.saveNewMarker(createMarker)
            Alert.alert('Success!', 'Created a new need!', [{ text: 'OK', onPress: this.props.cancelTapped, style: 'default' }])
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'Something went wrong, please try again.')
        }


    }

    renderPin = () => {
        if (this.state.currentLocation !== null) {
            return (
                <MapView.Marker
                    ref='marker'
                    draggable
                    onDragEnd={(event) => this.setState({ pinLocation: event.nativeEvent.coordinate })}
                    pinColor={'red'}
                    coordinate={{
                        latitude: this.state.currentLocation.latitude,
                        longitude: this.state.currentLocation.longitude
                    }}
                    title={'test'}
                    description={'this is a need'}
                    key={'blah'}
                >
                </MapView.Marker>
            )
        } else {
            return null
        }
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
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: 29.7630556,
                        longitude: -95.3630556,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    showsUserLocation={true}
                >
                    {this.renderPin()}
                </MapView>
                <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }}
                    contentContainerStyle={{ flex: 1, backgroundColor: 'white' }}
                    behavior={'position'}>
                    <View style={{ flex: 1 }}>
                        <FlatList data={[MarkerValue.Name, MarkerValue.Address, MarkerValue.Phone, MarkerValue.Description]}
                            renderItem={this.renderItem}
                            keyExtractor={this.keyExtractor}
                            extraData={this.state.selectedCategories}
                            ItemSeparatorComponent={Separator}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} />
                    <TouchableOpacity style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 45
                    }}
                        onPress={this.props.cancelTapped}>
                        <Text style={{ color: '#A2AEB6', fontWeight: '600' }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#50E3C2',
                        height: 45
                    }}
                        onPress={this.createNeed}>
                        <Text style={{ color: 'white', fontWeight: '600' }}>Done</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View >
        )
    }
}
