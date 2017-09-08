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
import { Separator } from "./Separator";

type LatLng = {
    latitude: number,
    longitude: number,
}

type Point = {
    x: number,
    y: number,
}

export enum MarkerValue {
    Name,
    Phone,
    Address,
    Description,
    Email
}
interface Props {
    cancelTapped: () => void
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

    renderItem = ({ item, index }: { item: string, index: number }) => {
        let height = item === 'I Have ...' ? 100 : 45
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

    viewForCell = (item: string) => {
        switch (item) {
            case 'Phone Number':
                return <TextCell placeholder={'Phone Number'}
                    keyboardType={'phone-pad'}
                    markerValue={MarkerValue.Phone}
                    textChanged={this.updateState} />
            case 'Name':
                return <TextCell placeholder={item}
                    markerValue={MarkerValue.Name}
                    textChanged={this.updateState} />
            case 'Category':
                return <ButtonCell buttonTitle={'Select Category'}
                    value={`${Object.keys(this.state.selectedCategories).length} Selected`}
                    onButtonPress={() => this.setState({ modalVisible: true })} />
            case 'Email':
                return <TextCell placeholder={item}
                    markerValue={MarkerValue.Email}
                    textChanged={this.updateState} />
            case 'I Have ...':
                return <TextCell placeholder={item}
                    markerValue={MarkerValue.Description}
                    textChanged={this.updateState} />
            case 'Address':
                return <TextCell placeholder={item}
                    markerValue={MarkerValue.Address}
                    textChanged={this.updateState} />

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

    onDragEnd = (info: { coordinate: LatLng, position: Point }) => {
        this.setState({ pinLocation: info.coordinate })
    }

    createNeed = async () => {
        let createMarker = new CreateMarker()
        createMarker.name = this.state.name
        createMarker.marker_type = 'need'
        createMarker.address = this.state.address
        createMarker.description = this.state.description
        createMarker.phone = this.state.phone
        createMarker.latitude = this.state.pinLocation.latitude
        createMarker.longitude = this.state.pinLocation.longitude
        createMarker.category = { labor: [{ muck: null }] }
        Alert.alert('Coming Soon!')
        // try {
        //     let result = await API.saveNewMarker(createMarker)
        //     console.log(`created a new marker: ${result}`)
        // } catch (error) {
        //     console.log('could not create a new marker')
        // }


    }

    renderPin = () => {
        if (this.state.currentLocation !== null) {
            return (
                <MapView.Marker
                    draggable
                    onDragEnd={this.onDragEnd}
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
                        <FlatList data={['Name', 'Address', 'Phone Number', 'I Have ...']}
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
