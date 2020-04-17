import React, {Component} from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import MapView from 'react-native-maps';
import {LocationManager} from '../API/LocationManager';
import {TextCell} from './TextCell';
import {ButtonCell} from './ButtonCell';
import {CategoryList, Category} from './CategoryList';
import {
  API,
  CreateMarker,
  KeyedCollection,
  IKeyedCollection,
  Need,
} from './../API/API';
import {UUIDHelper} from './../API/UUIDHelper';
import {Separator} from './Separator';
import {Colors, SmallButtonText} from '../constants';
import {strings} from './../localization/Strings';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';
type LatLng = {
  latitude: number;
  longitude: number;
};

type Point = {
  x: number;
  y: number;
};

export enum MarkerValue {
  Name = 1,
  Phone,
  Address,
  Description,
  Email,
  FakeHeader,
}

export enum MarkerType {
  Have = 1,
  Need,
}

interface Props {
  cancelTapped: () => void;
  markerType: MarkerType;
  editingNeed?: Need;
}

interface State {
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  pinLocation: {
    latitude: number;
    longitude: number;
  };
  modalVisible: boolean;
  selectedCategories: {};
  phone: string;
  name: string;
  address: string;
  email?: string;
  description: string;
  listData: any[];
  categoryMap: Object;
}

export class HavesView extends Component<Props, State> {
  textChangedDate: Date;
  localizedStrings: Object = {categories: 'I Need Help With'};
  constructor(props) {
    super(props);
    let need = null;
    if (
      this.props.editingNeed === undefined ||
      this.props.editingNeed === null
    ) {
      need = new Need({});
    } else {
      need = this.props.editingNeed;
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
      listData: [
        {
          data: [
            MarkerValue.Name,
            MarkerValue.Address,
            MarkerValue.Phone,
            MarkerValue.FakeHeader,
          ],
          key: strings.myInfo,
          keyExtractor: this.keyExtractor,
          renderItem: this.renderItem,
        },
      ],
      selectedCategories: need.categories || {},
      categoryMap: {},
    };
  }

  async readCategories() {
    try {
      let value = await AsyncStorage.getItem('categories');
      if (value !== null) {
        let json = JSON.parse(value);
        let categoriesParsed = json.categories;
        let lang = strings.getLanguage();

        if (lang !== 'es' && lang !== 'en' && lang !== 'hi') {
          lang = 'en';
        }
        let localized = json[lang];
        this.localizedStrings = localized;
        let categoryData = categoriesParsed.map((val) => {
          let keyName = Object.getOwnPropertyNames(val)[0];
          let values = val[keyName];

          if (values === null || values === undefined) {
            return;
          }
          let data = values.map((prop) => Object.getOwnPropertyNames(prop)[0]);
          return new Category(
            keyName,
            data,
            this.keyExtractor,
            this.renderCategoryItem,
          );
        });
        categoryData.splice(0, 0, this.state.listData[0]);
        this.setState({listData: categoryData});
      }
    } catch (error) {
      console.log(error);
    }
  }

  renderItem = ({item, index}: {item: MarkerValue; index: number}) => {
    let height = item === MarkerValue.Description ? 100 : 45;
    return (
      <View
        style={{
          height: height,
          justifyContent: 'center',
        }}>
        {this.viewForCell(item)}
      </View>
    );
  };

  itemSelected = (key: string, item: string) => {
    let items = this.state.selectedCategories[key];
    if (items !== null && items !== undefined) {
      return items.filter((firstVal) => firstVal === item).length > 0;
    } else {
      return false;
    }
  };

  renderCategoryItem = ({
    item,
    index,
    section,
  }: {
    item: string;
    index: number;
    section: any;
  }) => {
    return (
      <TouchableOpacity
        style={{
          height: 40,
          padding: 10,
          backgroundColor: Colors.white,
        }}
        onPress={() => {
          if (this.itemSelected(section.key, item)) {
            let current = {...this.state.selectedCategories};
            let items = current[section.key];
            let foundIndex = items.findIndex((val) => val === item);
            items.splice(foundIndex, 1);
            if (items.length === 0) {
              delete current[section.key];
            }
            this.setState({selectedCategories: current});
          } else {
            let current = {...this.state.selectedCategories};

            if (!current[section.key]) {
              let array = current[section.key] ? current[section.key] : [];
              array.push(item);
              current[section.key] = array;
              this.setState({selectedCategories: current});
            } else {
              alert('Please make one selection from same grocery');
            }
          }
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={{color: Colors.needText}}>
            {this.localizedStrings[item]}
          </Text>
          {this.renderCheckmark(section, item)}
        </View>
      </TouchableOpacity>
    );
  };

  renderCheckmark = (section: any, item: string) => {
    if (this.itemSelected(section.key, item)) {
      return <FAIcon name="check" size={15} style={{color: Colors.black}} />;
    } else {
      return <View />;
    }
  };

  updateState = async (value: string, marker: MarkerValue) => {
    switch (marker) {
      case MarkerValue.Address:
        let now = new Date();
        this.setState({address: value});
        if (
          value.length > 8 &&
          this.textChangedDate !== undefined &&
          now.valueOf() - this.textChangedDate.valueOf() > 1000
        ) {
          try {
            let result = await API.getLatLangFromAddress(value);
            const updatedLocation = {
              latitude: result.lat,
              longitude: result.lng,
            };
            this.setState({
              pinLocation: updatedLocation,
              currentLocation: updatedLocation,
            });
          } catch (error) {
            console.log(error);
          }
        }
        this.textChangedDate = new Date();
        break;
      case MarkerValue.Name:
        this.setState({name: value});
        break;
      case MarkerValue.Phone:
        this.setState({phone: value});
        break;
      case MarkerValue.Description:
        this.setState({description: value});
        break;
      case MarkerValue.Email:
        this.setState({email: value});
        break;
    }
  };

  viewForCell = (item: MarkerValue) => {
    switch (item) {
      case MarkerValue.Phone:
        return (
          <View style={{marginHorizontal: 10}}>
            <TextCell
              placeholder={strings.phoneNumberLabel}
              keyboardType={'phone-pad'}
              markerValue={MarkerValue.Phone}
              textChanged={this.updateState}
              value={this.state.phone}
            />
          </View>
        );
      case MarkerValue.Name:
        return (
          <View style={{marginHorizontal: 10}}>
            <TextCell
              placeholder={strings.nameLabel}
              markerValue={MarkerValue.Name}
              textChanged={this.updateState}
              value={this.state.name}
            />
          </View>
        );
      case MarkerValue.Address:
        return (
          <View style={{marginHorizontal: 10}}>
            <TextCell
              placeholder={strings.addressLabel}
              ref="addressCell"
              markerValue={MarkerValue.Address}
              textChanged={this.updateState}
              value={this.state.address}
            />
          </View>
        );
      case MarkerValue.FakeHeader:
        return (
          <View>
            <Text
              style={{
                height: 45,
                padding: 10,
                color: Colors.needText,
                backgroundColor: '#F5F5F5',
                fontWeight: 'bold',
              }}>
              {this.localizedStrings['categories']}
            </Text>
            <View style={{height: 1, backgroundColor: Colors.separatorColor}} />
          </View>
        );
    }
  };

  keyExtractor = (_: MarkerValue, index: number): string => {
    return `${index}`;
  };

  updateAddressFromCoords = async (coords) => {
    try {
      let address = await API.getAddressFromLatLang(
        coords.latitude,
        coords.longitude,
      );
      this.setState({address: address});
    } catch (error) {}
  };

  componentDidMount() {
    this.readCategories();
    LocationManager.getCurrentPosition().then((position) => {
      this.updateAddressFromCoords(position.coords);
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      this.setState({
        currentLocation: location,
        pinLocation: location,
      });
    });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      this.state.currentLocation !== null &&
      this.state.currentLocation !== prevState.currentLocation
    ) {
      (this.refs.havesMap as MapView).animateToCoordinate(
        this.state.currentLocation,
        300,
      );
    }
  }

  updateNeed = async () => {
    let createMarker = new CreateMarker();
    createMarker.id = this.props.editingNeed.id;
    createMarker.name = this.state.name;
    let type = this.props.markerType === MarkerType.Need ? 'need' : 'have';
    createMarker.marker_type = type;
    createMarker.address = this.state.address;
    createMarker.description = this.state.description;
    createMarker.phone = this.state.phone;
    createMarker.latitude = this.state.pinLocation.latitude;
    createMarker.longitude = this.state.pinLocation.longitude;
    createMarker.categories = this.state.selectedCategories;

    try {
      let result = await API.updateMarker(createMarker);
      Alert.alert('Success!', 'Updated the need!', [
        {text: 'OK', onPress: this.props.cancelTapped, style: 'default'},
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong, please try again.');
    }
  };

  createNeed = async () => {
    let createMarker = new CreateMarker();
    createMarker.name = this.state.name;
    let type = this.props.markerType === MarkerType.Need ? 'need' : 'have';
    createMarker.marker_type = type;
    createMarker.address = this.state.address;
    createMarker.description = this.state.description;
    createMarker.phone = this.state.phone;
    createMarker.latitude = this.state.pinLocation.latitude;
    createMarker.longitude = this.state.pinLocation.longitude;
    createMarker.categories = this.state.selectedCategories;

    try {
      let result = await API.saveNewMarker(createMarker);
      Alert.alert('Success!', 'Created a new need!', [
        {text: 'OK', onPress: this.props.cancelTapped, style: 'default'},
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong, please try again.');
    }
  };

  handlePinDrag = async (event) => {
    let dict = event.nativeEvent.coordinate;
    try {
      let address = await API.getAddressFromLatLang(
        dict.latitude,
        dict.longitude,
      );
      this.setState({pinLocation: dict, address: address});
    } catch (error) {
      console.log(error);
      this.setState({pinLocation: dict});
    }
  };

  renderPin = () => {
    if (this.state.currentLocation !== null) {
      return (
        <MapView.Marker
          ref="marker"
          draggable
          centerOffset={{x: 0, y: -25}}
          onDragEnd={this.handlePinDrag}
          coordinate={{
            latitude: this.state.currentLocation.latitude,
            longitude: this.state.currentLocation.longitude,
          }}
          key={'blah'}>
          <FAIcon name="map-marker" size={60} style={{color: Colors.red}} />
        </MapView.Marker>
      );
    } else {
      return null;
    }
  };

  renderHeader = (item) => {
    return (
      <Text
        style={{
          height: 40,
          padding: 10,
          color: Colors.needText,
          backgroundColor: '#F5F5F5',
          fontWeight: 'bold',
        }}>
        {this.localizedStrings[item.section.key]}
      </Text>
    );
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <MapView
          ref="havesMap"
          style={{flex: 0.5}}
          showsUserLocation={true}
          followsUserLocation={true}>
          {this.renderPin()}
        </MapView>
        <KeyboardAvoidingView
          style={{flex: 1, backgroundColor: Colors.white}}
          contentContainerStyle={{flex: 1, backgroundColor: Colors.white}}
          behavior={'position'}
          keyboardVerticalOffset={-250}>
          <View style={{flex: 1}}>
            <SectionList
              renderSectionHeader={this.renderHeader}
              ItemSeparatorComponent={Separator}
              sections={this.state.listData}
              extraData={this.state}
            />
          </View>
          <View style={{height: 1, backgroundColor: Colors.separatorColor}} />
          {this.renderDeleteButton()}
          {this.renderBottomButtons()}
        </KeyboardAvoidingView>
      </View>
    );
  }

  renderDeleteButton = () => {
    if (
      this.props.editingNeed === undefined ||
      this.props.editingNeed === null
    ) {
      return <View></View>;
    } else {
      return (
        <View>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.white,
              height: 45,
            }}
            onPress={() => this.deleteMarkerTapped(this.props.editingNeed)}>
            <Text style={{...SmallButtonText, color: '#A2AEB6'}}>
              {strings.deleteMarkerAction}
            </Text>
          </TouchableOpacity>
          <View style={{height: 1, backgroundColor: Colors.separatorColor}} />
        </View>
      );
    }
  };

  renderBottomButtons = () => {
    let text = null;
    let func = null;
    if (
      this.props.editingNeed === undefined ||
      this.props.editingNeed === null
    ) {
      text = strings.doneAction;
      func = this.createNeed;
    } else {
      text = strings.updateAction;
      func = this.updateNeed;
    }
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            height: 45,
          }}
          onPress={this.props.cancelTapped}>
          <Text style={{...SmallButtonText, color: '#A2AEB6'}}>
            {strings.cancelAction}
          </Text>
        </TouchableOpacity>
        <View
          style={{
            height: 45,
            width: 1,
            backgroundColor: Colors.separatorColor,
          }}></View>
        <TouchableOpacity
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#50E3C2',
            height: 45,
          }}
          onPress={func}>
          <Text style={SmallButtonText}>{text}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  deleteMarkerTapped = (item: Need) => {
    Alert.alert(
      'Are you sure?',
      `Do you want to delete this need '${item.name}'`,
      [
        {
          text: 'OK',
          onPress: () => this.deleteMarker(item),
          style: 'destructive',
        },
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  };

  deleteMarker = async (marker: Need) => {
    let createMarker = new CreateMarker();
    createMarker.name = marker.name;
    createMarker.id = marker.id;
    createMarker.marker_type = marker.markerType;
    createMarker.address = marker.address;
    createMarker.description = marker.description;
    createMarker.phone = marker.phone;
    createMarker.latitude = marker.latitude;
    createMarker.longitude = marker.longitude;
    createMarker.categories = marker.categories;
    createMarker.resolved = true;

    try {
      await API.updateMarker(createMarker);
      this.props.cancelTapped();
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong, please try again.');
    }
  };
}
