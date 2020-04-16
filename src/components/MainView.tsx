import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import EntypoIcon from 'react-native-vector-icons/Entypo';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';
import MapView from 'react-native-maps';

import {LocationManager} from '../API/LocationManager';
import {CardView} from './CardView';
import PageControl from 'react-native-page-control';
import {
  API,
  Need,
  KeyedCollection,
  Marker,
  CreateMarker,
  IKeyedCollection,
} from '../API/API';

import {ModalView} from './ModalView';

import {strings} from '../localization/Strings';

import {styles, Colors} from '../constants';

const DEFAULT_VP_DELTA = {
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const INITIAL_REGION = {
  latitude: 29.7630556,
  longitude: -95.3630556,
  ...DEFAULT_VP_DELTA,
};

interface Props {}

interface State {
  needs: Need[];
  categories: KeyedCollection<any>;
  currentPage: number;
  filters: string[];
  selectedNeedId: string | null;
  modalVisible: boolean;
  modalType: string;
  currentPosition: Position | null;
}

export class MainView extends Component<Props, State> {
  private watchId: number;
  localizedStrings: Object = {};

  constructor(props) {
    super(props);
    this.state = {
      needs: [],
      categories: new KeyedCollection(),
      currentPage: -1,
      filters: [],
      selectedNeedId: null,
      modalVisible: false,
      modalType: '',
      currentPosition: null,
    };
  }

  componentDidMount() {
    LocationManager.getCurrentPosition().then((pos) =>
      this.setState({currentPosition: pos}),
    );
    AsyncStorage.getItem('onboardHelpSeen', (error, result) => {
      if (result === null) {
        this.showOnboardingView();
      }
    });
    this.getNeeds();
    this.getCategories();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.currentPosition && prevState.currentPosition === null) {
      (this.refs.mainMap as MapView).animateToCoordinate(
        this.state.currentPosition.coords,
        300,
      );
    }

    if (prevState.modalVisible && !this.state.modalVisible) {
      this.getNeeds();
      if (prevState.modalType === 'ONBOARD' && this.state.modalType === '') {
        AsyncStorage.setItem('onboardHelpSeen', 'true');
      }
    }
  }

  getCategories = async () => {
    let {categories, all} = await API.getCategories();
    if (categories !== undefined || categories !== null) {
      let lang = strings.getLanguage();

      if (lang !== 'es' && lang !== 'en' && lang !== 'hi') {
        lang = 'en';
      }
      let localized = all[lang];

      this.localizedStrings = localized;
      this.setState({categories: categories});
    }
  };

  getNeeds = async () => {
    let needs = await API.getNeeds();
    if (needs !== undefined || needs !== null) {
      needs = needs.filter((need) => need.latitude && need.longitude);
      this.setState({needs: needs});
    }
  };

  keyExtractor = (_: string, index: number): string => {
    return `${index}`;
  };

  onScrollEnd = (e) => {
    const {width} = Dimensions.get('window');
    let contentOffset = e.nativeEvent.contentOffset;
    let viewSize = e.nativeEvent.layoutMeasurement;

    let pageNum = Math.floor(contentOffset.x / (viewSize.width || width));

    if (pageNum === this.state.currentPage) {
      return;
    }

    const filteredNeeds = this.getFilteredNeeds();
    const targetNeed = filteredNeeds[pageNum];

    this.setState(
      {
        currentPage: pageNum,
        selectedNeedId: `${targetNeed.id}`,
      },
      () => {
        if (this.state.currentPage === -1) {
          return;
        }

        (this.refs.mainMap as MapView).animateToCoordinate(
          filteredNeeds[pageNum].coordinate(),
          300,
        );
      },
    );
  };

  getFilteredNeeds = () => {
    let needs = this.state.needs.slice();

    if (needs.length === 0 || this.state.filters.length === 0) {
      return needs;
    }

    let filteredNeeds = needs.filter((need) =>
      this.state.filters.includes(
        _.chain(need.categories).keys().capitalize().value(),
      ),
    );
    if (this.state.currentPosition) {
      let {latitude, longitude} = this.state.currentPosition.coords;
      filteredNeeds = filteredNeeds.sort((lhs, rhs) => {
        let lhsDistance = lhs.distanceToCoordinate({latitude, longitude});
        let rhsDistance = rhs.distanceToCoordinate({latitude, longitude});
        return lhsDistance - rhsDistance;
      });
    }
    return filteredNeeds;
  };

  renderNeeds = () => {
    return this.getFilteredNeeds().map((marker) => {
      return (
        <MapView.Marker
          ref={`marker-${marker.id}`}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          identifier={`${marker.id}`}
          onPress={this.onPressNeedMarker}
          key={marker.id}>
          <FAIcon name="map-marker" size={60} style={{color: Colors.red}} />
        </MapView.Marker>
      );
    });
  };

  renderActionButtonsIfNecessary = () => {
    if (this.state.selectedNeedId) {
      return;
    }

    return (
      <View style={styles.actionButtonContainer}>
        <View style={styles.actionButtonSpacer} />
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => this.onPressActionButton('NEED')}
          style={StyleSheet.flatten([
            styles.actionButton,
            styles.actionButtonNeed,
          ])}>
          <EntypoIcon name="edit" size={15} style={styles.actionButtonIcon} />
          <Text style={styles.actionButtonText}>
            {strings.needAction.toLocaleUpperCase()}
          </Text>
        </TouchableOpacity>
        <View style={styles.actionButtonSpacer} />
      </View>
    );
  };

  renderNeedCardViewIfNecessary = () => {
    if (!this.state.selectedNeedId) {
      return;
    }

    const needs = this.getFilteredNeeds();
    const selectedNeedIndex = needs.findIndex((need) => {
      return +need.id === +this.state.selectedNeedId;
    });

    return (
      <View style={styles.cardViewContainer}>
        <FlatList
          ref="cardViewList"
          data={needs}
          extraData={{
            selectedNeedId: this.state.selectedNeedId,
          }}
          getItemLayout={(data, index) => {
            const {width} = Dimensions.get('window');

            return {
              offset: width * index,
              length: width,
              index,
            };
          }}
          initialScrollIndex={selectedNeedIndex}
          renderItem={this.renderCardView}
          keyExtractor={this.keyExtractor}
          horizontal
          pagingEnabled
          onMomentumScrollEnd={this.onScrollEnd}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  renderCardView = ({item, index}: {item: Need; index: number}) => {
    const {width, height} = Dimensions.get('window');

    return (
      <CardView
        need={item}
        needFlagged={this.getNeeds}
        localizedCategories={this.localizedStrings}
      />
    );
  };

  onPressActionButton = (type: string) => {
    this.setState({
      modalVisible: true,
      selectedNeedId: null,
      modalType: type,
    });
  };

  dismissModal = () => {
    this.setState({
      modalVisible: false,
      modalType: '',
    });
  };

  offsetCoordinate(coordinate) {
    return {
      latitude: coordinate.latitude - 0.02,
      longitude: coordinate.longitude,
      ...DEFAULT_VP_DELTA,
    };
  }

  onPressNeedMarker = (e) => {
    e.stopPropagation();
    const {id, coordinate} = e.nativeEvent;
    (this.refs.mainMap as MapView).animateToCoordinate(coordinate, 300);

    const needs = this.getFilteredNeeds();
    const prevSelectedId = this.state.selectedNeedId;
    let selectedNeedIndex = needs.findIndex((need) => {
      return +need.id === +id;
    });

    this.setState({selectedNeedId: id}, () => {
      if (!prevSelectedId) {
        return;
      }

      if (selectedNeedIndex < 0) {
        return;
      }

      this.refs.cardViewList.scrollToIndex({
        index: selectedNeedIndex,
        animated: true,
      });
    });
  };

  onSelectFilters = (filters: string[]) => {
    this.setState({
      filters,
      modalVisible: false,
      modalType: '',
    });
  };

  onPressMap(e) {
    // dismiss modal view if not selecting a pin
    this.setState((prevState, props) => {
      if (prevState.selectedNeedId !== null) {
        return {selectedNeedId: null};
      }
      return null;
    });
  }

  showAboutView = () => {
    this.setState({
      modalVisible: true,
      modalType: 'ABOUT',
    });
  };

  showOnboardingView = () => {
    this.setState({
      modalVisible: true,
      modalType: 'ONBOARD',
    });
  };

  render() {
    const {height} = Dimensions.get('window');

    return (
      <View style={{flex: 1}}>
        <ModalView
          modalVisible={this.state.modalVisible}
          modalType={this.state.modalType}
          onCancel={this.dismissModal}
          onSelectFilters={this.onSelectFilters}
          categories={this.state.categories}
          filters={this.state.filters}
        />

        <MapView
          ref="mainMap"
          style={{flex: 1}}
          initialRegion={INITIAL_REGION}
          onPress={this.onPressMap.bind(this)}
          showsUserLocation={true}>
          {this.renderNeeds()}
        </MapView>
        <View
          style={{flex: 1, left: 0, right: 0, top: 20, position: 'absolute'}}>
          <View style={styles.actionButtonContainer}>
            <View style={styles.actionButtonSpacer} />
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => this.onPressActionButton('FILTER')}
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.actionButtonFilter,
              ])}>
              <FAIcon name="filter" size={15} style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>
                {strings.filterAction.toLocaleUpperCase()}
              </Text>
            </TouchableOpacity>
            <View style={styles.actionButtonSpacer} />
          </View>
        </View>
        <View style={styles.cardSheet}>
          {this.renderActionButtonsIfNecessary()}
          {this.renderNeedCardViewIfNecessary()}
        </View>
        {this.renderInfoButton()}
      </View>
    );
  }

  renderInfoButton = () => {
    if (!this.state.selectedNeedId) {
      return (
        <TouchableOpacity
          style={{position: 'absolute', right: 10, bottom: 28}}
          onPress={this.showAboutView}>
          <Image
            source={require('./../images/info.png')}
            style={{width: 28, height: 28}}
          />
        </TouchableOpacity>
      );
    } else {
      return <View />;
    }
  };
}
