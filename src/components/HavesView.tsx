import React, { Component } from 'react';
import {
    View,
    Text,
    FlatList,
    SectionList,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Alert,
    AsyncStorage
} from 'react-native';
import MapView from 'react-native-maps'
import { TextCell } from './TextCell'
import { ButtonCell } from './ButtonCell'
import { CategoryList, Category } from './CategoryList'
import { API, CreateMarker, KeyedCollection, IKeyedCollection, Need } from './../API/API'
import { UUIDHelper } from './../API/UUIDHelper'
import { Separator } from "./Separator";
import { Colors } from './Colors'
import { strings } from './../localization/Strings'
import FAIcon from 'react-native-vector-icons/FontAwesome';
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
    markerType: MarkerType,
    editingNeed?: Need

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
    description: string,
    listData: any[],
    categoryMap: Object

}
export class HavesView extends Component<Props, State> {
    textChangedDate: Date
    constructor(props) {
        super(props)
        let need = null
        if (this.props.editingNeed === undefined || this.props.editingNeed === null) {
            need = new Need({})
        } else {
            need = this.props.editingNeed
        }
        this.state = {
            pinLocation: null,
            currentLocation: null,
            modalVisible: false,
            phone: need.phone || '',
            description: need.description || '',
            email: need.email || '',
            address: need.address || '',
            name: need.name || '',
            listData: [{
                data:
                [MarkerValue.Name, MarkerValue.Address, MarkerValue.Phone],
                key: 'My Info',
                keyExtractor: this.keyExtractor,
                renderItem: this.renderItem
            }],
            selectedCategories: need.categories || {},
            categoryMap: {}
        }
    }

    async readCategories() {
        try {
            let value = await AsyncStorage.getItem('categories');
            if (value !== null) {
                let json = JSON.parse(value);
                let categoriesParsed = json.categories
                let lang = strings.getInterfaceLanguage()
                if (lang !== 'es' && lang !== 'en') {
                    lang = 'en'
                }
                let localized = json[lang]

                let categoryData = categoriesParsed.map((val) => {
                    let keyName = Object.getOwnPropertyNames(val)[0];
                    let values = val[keyName];

                    if (values === null || values === undefined) { return; }
                    let data = values.map((prop) => localized[Object.getOwnPropertyNames(prop)[0]]);
                    return new Category(localized[keyName], data, this.keyExtractor, this.renderCategoryItem);
                });
                let final = categoryData.splice(0, 0, this.state.listData[0])
                this.setState({ listData: categoryData });
            }
        } catch (error) {
            console.log(error);
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

    itemSelected = (key: string, item: string) => {
        let items = this.state.selectedCategories[key]
        if (items !== null && items !== undefined) {
            return items.filter((firstVal) => firstVal === item).length > 0
        } else {
            return false
        }
    }

    renderCategoryItem = ({ item, index, section }: { item: string, index: number, section: any }) => {
        return (
            <TouchableOpacity style={{
                height: 40,
                padding: 10,
                backgroundColor: this.itemSelected(section.key, item) ? Colors.green : Colors.white
            }}
                onPress={() => {
                    if (this.itemSelected(section.key, item)) {
                        let current = { ...this.state.selectedCategories }
                        let items = current[section.key]
                        let foundIndex = items.findIndex((val) => val === item)
                        items.splice(foundIndex, 1)
                        if (items.length === 0) {
                            delete current[section.key]
                        }
                        this.setState({ selectedCategories: current })
                    } else {
                        let current = { ...this.state.selectedCategories }

                        let array = current[section.key] ? current[section.key] : []
                        array.push(item)
                        current[section.key] = array
                        this.setState({ selectedCategories: current })
                    }
                }}>
                <Text style={{ color: this.itemSelected(section.key, item) ? Colors.white : Colors.black }}>{item}</Text>
            </TouchableOpacity>
        )
    }

    updateState = async (value: string, marker: MarkerValue) => {
        switch (marker) {
            case MarkerValue.Address:
                let now = new Date()
                this.setState({ address: value })
                if (value.length > 8
                    && this.textChangedDate !== undefined
                    && now.valueOf() - this.textChangedDate.valueOf() > 1000) {

                    try {

                        let result = await API.getLatLangFromAddress(value)
                        const updatedLocation = {
                            latitude: result.lat,
                            longitude: result.lng
                        }
                        this.setState({
                            pinLocation: updatedLocation,
                            currentLocation: updatedLocation
                        }, () => {
                            this.refs.havesMap.animateToCoordinate(updatedLocation, 300)
                        })
                    } catch (error) {
                        console.log(error)
                    }
                }
                this.textChangedDate = new Date()
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
                    textChanged={this.updateState}
                    value={this.state.phone} />
            case MarkerValue.Name:
                return <TextCell placeholder={'Name'}
                    markerValue={MarkerValue.Name}
                    textChanged={this.updateState}
                    value={this.state.name} />
            case MarkerValue.Email:
                return <TextCell placeholder={'Email'}
                    markerValue={MarkerValue.Email}
                    textChanged={this.updateState}
                    value={this.state.email} />
            case MarkerValue.Description:
                let placeholder = this.props.markerType === MarkerType.Need ? 'I Need ...' : 'I Have ...'
                return <TextCell placeholder={placeholder}
                    markerValue={MarkerValue.Description}
                    textChanged={this.updateState}
                    value={this.state.description} />
            case MarkerValue.Address:
                return <TextCell placeholder={'Address'}
                    ref='addressCell'
                    markerValue={MarkerValue.Address}
                    textChanged={this.updateState}
                    value={this.state.address} />

        }
    }

    keyExtractor = (_: MarkerValue, index: number): string => {
        return `${index}`
    }

    updateAddressFromCoords = async (coords) => {
        try {
            let address = await API.getAddressFromLatLang(coords.latitude, coords.longitude)
            this.setState({ address: address })
        } catch (error) {

        }
    }

    getCurrentLocation = async () => {
        navigator.geolocation.getCurrentPosition((position) => {
            this.updateAddressFromCoords(position.coords)
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

    componentDidMount() {
        this.readCategories()
        this.getCurrentLocation()

    }

    updateNeed = async () => {
        let createMarker = new CreateMarker()
        createMarker.id = this.props.editingNeed.id
        createMarker.name = this.state.name
        let type = this.props.markerType === MarkerType.Need ? 'need' : 'have'
        createMarker.marker_type = type
        createMarker.address = this.state.address
        createMarker.description = this.state.description
        createMarker.phone = this.state.phone
        createMarker.latitude = this.state.pinLocation.latitude
        createMarker.longitude = this.state.pinLocation.longitude
        createMarker.categories = this.state.selectedCategories

        try {
            let result = await API.updateMarker(createMarker)
            Alert.alert('Success!', 'Updated the need!', [{ text: 'OK', onPress: this.props.cancelTapped, style: 'default' }])
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'Something went wrong, please try again.')
        }
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
        createMarker.categories = this.state.selectedCategories

        try {
            let result = await API.saveNewMarker(createMarker)
            Alert.alert('Success!', 'Created a new need!', [{ text: 'OK', onPress: this.props.cancelTapped, style: 'default' }])
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'Something went wrong, please try again.')
        }


    }

    handlePinDrag = async (event) => {
        let dict = event.nativeEvent.coordinate
        try {
            let address = await API.getAddressFromLatLang(dict.latitude, dict.longitude)
            this.setState({ pinLocation: dict, address: address })
        } catch (error) {
            console.log(error)
            this.setState({ pinLocation: dict })
        }
    }

    renderPin = () => {
        if (this.state.currentLocation !== null) {
            return (
                <MapView.Marker
                    ref='marker'
                    draggable
                    onDragEnd={this.handlePinDrag}
                    coordinate={{
                        latitude: this.state.currentLocation.latitude,
                        longitude: this.state.currentLocation.longitude
                    }}
                    key={'blah'}
                >
                    <FAIcon name='map-marker' size={40} style={{ color: 'red' }} />
                </MapView.Marker>
            )
        } else {
            return null
        }
    }

    renderHeader = (item) => {
        return (
            <Text style={{
                height: 40, padding: 10,
                color: Colors.darkblue, backgroundColor: '#F5F5F5',
                fontWeight: 'bold'
            }}>{item.section.key}</Text>
        )
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <MapView
                    ref='havesMap'
                    style={{ flex: 0.5 }}
                    showsUserLocation={true}
                    followsUserLocation={true}
                >
                    {this.renderPin()}
                </MapView>
                <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.white }}
                    contentContainerStyle={{ flex: 1, backgroundColor: Colors.white }}
                    behavior={'position'}>
                    <View style={{ flex: 1 }}>
                        <SectionList
                            renderSectionHeader={this.renderHeader}
                            ItemSeparatorComponent={Separator}
                            sections={this.state.listData}
                            extraData={this.state}
                        />
                    </View>
                    <View style={{ height: 1, backgroundColor: Colors.separatorColor }} />
                    {this.renderDeleteButton()}
                    {this.renderBottomButtons()}
                </KeyboardAvoidingView>
            </View >
        )
    }

    renderDeleteButton = () => {
        if (this.props.editingNeed === undefined || this.props.editingNeed === null) {
            return <View></View>
        } else {
            return (
                <View>
                    <TouchableOpacity style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: Colors.white,
                        height: 45
                    }}
                        onPress={() => this.deleteMarkerTapped(this.props.editingNeed)}>
                        <Text style={{ color: '#A2AEB6', fontWeight: '600' }}>No Longer Needed</Text>
                    </TouchableOpacity>
                    <View style={{ height: 1, backgroundColor: Colors.separatorColor }} />
                </View>
            )
        }
    }

    renderBottomButtons = () => {
        let text = null
        let func = null
        if (this.props.editingNeed === undefined || this.props.editingNeed === null) {
            text = 'Done'
            func = this.createNeed
        } else {
            text = 'Update'
            func = this.updateNeed
        }
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 45
                }}
                    onPress={this.props.cancelTapped}>
                    <Text style={{ color: '#A2AEB6', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <View style={{ height: 45, width: 1, backgroundColor: Colors.separatorColor }}></View>
                <TouchableOpacity style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#50E3C2',
                    height: 45
                }}
                    onPress={func}>
                    <Text style={{ color: Colors.white, fontWeight: '600' }}>{text}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    deleteMarkerTapped = (item: Need) => {
        Alert.alert('Are you sure?', `Do you want to delete this need '${item.name}'`, [{ text: 'OK', onPress: () => this.deleteMarker(item), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }])
    }

    deleteMarker = async (marker: Need) => {
        let createMarker = new CreateMarker()
        createMarker.name = marker.name
        createMarker.id = marker.id
        createMarker.marker_type = marker.markerType
        createMarker.address = marker.address
        createMarker.description = marker.description
        createMarker.phone = marker.phone
        createMarker.latitude = marker.latitude
        createMarker.longitude = marker.longitude
        createMarker.categories = marker.categories
        createMarker.resolved = true

        try {
            await API.updateMarker(createMarker)
            this.props.cancelTapped()
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'Something went wrong, please try again.')
        }
    }
}
