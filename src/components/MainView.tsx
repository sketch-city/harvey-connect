import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Modal } from 'react-native';

import EntypoIcon from 'react-native-vector-icons/Entypo';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';
import MapView from 'react-native-maps';

import { CardView } from './CardView'
import PageControl from 'react-native-page-control';
import {
    API,
    Need,
    KeyedCollection,
    Marker,
    CreateMarker,
    IKeyedCollection
} from '../API/API'

import { ModalView } from './ModalView';

import { strings } from '../localization/Strings';

const DEFAULT_VP_DELTA = {
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
}

const INITIAL_REGION = {
    latitude: 29.7630556,
    longitude: -95.3630556,
    ...DEFAULT_VP_DELTA
}

interface Props {
}

interface State {
    needs: Need[]
    categories: KeyedCollection<any>
    currentPage: number
    filters: string[],
    selectedNeedId: string | null
    modalVisible: boolean
    modalType: string
    currentPosition: Position | null
}

export class MainView extends Component<Props, State> {
    private watchId: number;

    constructor(props) {
        super(props);
        this.state = {
            needs: [],
            categories: new KeyedCollection,
            currentPage: -1,
            filters: [],
            selectedNeedId: null,
            modalVisible: false,
            modalType: '',
            currentPosition: null,
        };
    }

    componentDidMount() {
        this.watchId = navigator.geolocation.watchPosition((pos) => this.setState({ currentPosition: pos }), (err) => { }, { enableHighAccuracy: true })
        this.getNeeds();
        this.getCategories();
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchId);
    }

    getCategories = async () => {
        let categories = await API.getCategories()
        if (categories !== undefined || categories !== null) {
            this.setState({ categories: categories })
        }
    }

    getNeeds = async () => {
        let needs = await API.getNeeds();
        if (needs !== undefined || needs !== null) {
            needs = needs.filter(need => need.latitude && need.longitude)
            if (this.state.currentPosition) {
                let { latitude, longitude } = this.state.currentPosition.coords;
                needs = needs.sort((lhs, rhs) => {
                    let lhsDistance = lhs.distanceToCoordinate({ latitude, longitude });
                    let rhsDistance = rhs.distanceToCoordinate({ latitude, longitude });
                    return lhsDistance - rhsDistance;
                });
            }

            this.setState({ needs: needs })
        }
    }

    keyExtractor = (_: string, index: number): string => {
        return `${index}`
    };

    onScrollEnd = (e) => {
        const { width, height } = Dimensions.get('window');
        let contentOffset = e.nativeEvent.contentOffset;
        let viewSize = e.nativeEvent.layoutMeasurement;

        let pageNum = Math.floor(contentOffset.x / (viewSize.width || width))

        if (pageNum === this.state.currentPage) {
            return
        }
        const targetNeed = this.state.needs[pageNum]

        this.setState({
            currentPage: pageNum,
            selectedNeedId: `${targetNeed.id}`
        }, () => {
            if (this.state.currentPage === -1) {
                return
            }

            (this.refs.mainMap as MapView).animateToCoordinate(this.state.needs[pageNum].coordinate(), 300);
            this.refs[`marker-${targetNeed.id}`].showCallout();
        })
    };

    getFilteredNeeds = () => {
        let filteredNeeds = this.state.needs.slice();

        if (filteredNeeds.length === 0 || this.state.filters.length === 0) {
            return filteredNeeds;
        }

        return filteredNeeds.filter(need =>
            this.state.filters.includes(_.chain(need.categories).keys().capitalize().value())
        );
    }

    renderNeeds = () => {
        return this.getFilteredNeeds().map(marker => {
            return (
                <MapView.Marker
                    ref={`marker-${marker.id}`}
                    coordinate={{
                        latitude: marker.latitude,
                        longitude: marker.longitude
                    }}
                    identifier={`${marker.id}`}
                    onPress={this.onPressNeedMarker}
                    key={marker.id}
                >
                    <FAIcon name='map-marker' size={40} style={{ color: 'red' }} />
                </MapView.Marker>
            )

        })
    }

    renderActionButtonsIfNecessary = () => {
        if (this.state.selectedNeedId) {
            return
        }

        return (
            <View style={styles.actionButtonContainer}>
                <View style={styles.actionButtonSpacer} />
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => this.onPressActionButton('NEED')}
                    style={StyleSheet.flatten([styles.actionButton, styles.actionButtonNeed])}>
                    <EntypoIcon name="edit" size={15} style={styles.actionButtonIcon} />
                    <Text style={styles.actionButtonText}>{strings.needActionLabel.toLocaleUpperCase()}</Text>
                </TouchableOpacity>
                <View style={styles.actionButtonSpacer} />
            </View>
        );
    }

    renderNeedCardViewIfNecessary = () => {
        if (!this.state.selectedNeedId) {
            return
        }

        const needs = this.getFilteredNeeds()
        const selectedNeedIndex = needs.findIndex(need => {
            return +need.id === +this.state.selectedNeedId
        });

        return (
            <View style={styles.cardViewContainer}>
                <FlatList
                    ref='cardViewList'
                    data={needs}
                    extraData={{
                        selectedNeedId: this.state.selectedNeedId
                    }}
                    getItemLayout={(data, index) => {
                        const { width } = Dimensions.get('window');

                        return {
                            offset: width * index,
                            length: width,
                            index
                        }
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
        )
    }

    renderCardView = ({ item, index }: { item: Need, index: number }) => {
        const { width, height } = Dimensions.get('window');

        return (
            <CardView need={item} />
        )
    };

    onPressActionButton = (type: string) => {
        this.setState({
            modalVisible: true,
            modalType: type
        })
    }

    dismissModal() {
        this.setState({
            modalVisible: false,
            modalType: ''
        })
    }

    offsetCoordinate(coordinate) {
        return {
            latitude: coordinate.latitude - 0.02,
            longitude: coordinate.longitude,
            ...DEFAULT_VP_DELTA
        }
    }

    onPressNeedMarker = (e) => {
        e.stopPropagation();
        const { id, coordinate } = e.nativeEvent;
        (this.refs.mainMap as MapView).animateToCoordinate(coordinate, 300);

        const needs = this.getFilteredNeeds();
        const prevSelectedId = this.state.selectedNeedId;
        let selectedNeedIndex = needs.findIndex(need => {
            return +need.id === +id
        });

        this.setState({ selectedNeedId: id }, () => {
            if (!prevSelectedId) {
                return
            }

            if (selectedNeedIndex < 0) {
                return
            }

            this.refs.cardViewList.scrollToIndex({
                index: selectedNeedIndex,
                animated: true,
            })
        })
    }

    onSelectFilters(filters) {
        this.setState({
            filters,
            modalVisible: false,
            modalType: ''
        })
    }

    onPressMap(e) {
        // dismiss modal view if not selecting a pin
        this.setState({ selectedNeedId: null })
    }

    render() {
        const { height } = Dimensions.get('window');

        return (
            <View style={{ flex: 1 }}>
                <ModalView
                    modalVisible={this.state.modalVisible}
                    modalType={this.state.modalType}
                    onCancel={this.dismissModal.bind(this)}
                    onSelectFilters={this.onSelectFilters.bind(this)}
                    categories={this.state.categories}
                    filters={this.state.filters} />

                <MapView ref='mainMap'
                    style={{ flex: 1 }}
                    initialRegion={INITIAL_REGION}
                    onPress={this.onPressMap.bind(this)}
                    showsUserLocation={true}
                >
                    {this.renderNeeds()}
                </MapView>
                <View style={{ flex: 1, left: 0, right: 0, top: 20, position: 'absolute' }}>
                    <View style={styles.actionButtonContainer}>
                        <View style={styles.actionButtonSpacer} />
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => this.onPressActionButton('FILTER')}
                            style={StyleSheet.flatten([styles.actionButton, styles.actionButtonFilter])}>
                            <FAIcon name="filter" size={15} style={styles.actionButtonIcon} />
                            <Text style={styles.actionButtonText}>{strings.filterActionLabel.toLocaleUpperCase()}</Text>
                        </TouchableOpacity>
                        <View style={styles.actionButtonSpacer} />
                    </View>
                </View>
                <View style={styles.cardSheet}>
                    {this.renderActionButtonsIfNecessary()}
                    {this.renderNeedCardViewIfNecessary()}
                </View>
            </View>
        )
    }
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
    cardSheet: {
        left: 0,
        right: 0,
        bottom: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'absolute'
    },

    cardViewContainer: {
        flex: 1,
        height: 240,
        borderRadius: 50
    },

    actionButtonContainer: {
        height: 44,
        flexDirection: 'row',
        alignContent: 'space-around',
        justifyContent: 'space-between',
        margin: 10,
    },
    actionButton: {
        height: 44,
        flex: 1,
        backgroundColor: 'green',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 50,
        marginRight: 10,
        marginLeft: 10,
        shadowRadius: 1,
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.7,
        shadowColor: 'black',
        elevation: 4,
    },
    actionButtonSpacer: {
        height: 0,
        flex: 1,
        flexDirection: 'row',
        marginRight: 0,
        marginLeft: 0,
    },
    actionButtonIcon: {
        color: "#FFF",
        marginRight: 8
    },
    actionButtonFilter: {
        backgroundColor: '#FF5A5F',
    },
    actionButtonNeed: {
        backgroundColor: '#0080FE',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 15
    },
    pageControl: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 15
    },
    pageControlIndicator: {
        borderRadius: 5
    }
});
