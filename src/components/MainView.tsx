import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { API, Need, KeyedCollection, Marker, CreateMarker, IKeyedCollection } from '../API/API'
import { CalloutView } from './CalloutView'
import PageControl from 'react-native-page-control';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import MapView from 'react-native-maps';
import _ from 'lodash';
import { ModalView } from './ModalView';

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
                    pinColor={marker.markerType === 'need' ? 'red' : 'blue'}
                    coordinate={{
                        latitude: marker.latitude,
                        longitude: marker.longitude
                    }}
                    identifier={`${marker.id}`}
                    onPress={this.onPressNeedMarker}
                    title={marker.name}
                    description={marker.description}
                    key={marker.id}
                />
            )

        })
    }

    renderNeedCardView = () => {
        if (!this.state.selectedNeedId) {
            return
        }

        const needs = this.getFilteredNeeds()
        const selectedNeedIndex = needs.findIndex(need => {
            return +need.id === +this.state.selectedNeedId
        });

        return (
            <View style={styles.cardWrapper}>
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
                    renderItem={this.renderItem}
                    keyExtractor={this.keyExtractor}
                    horizontal
                    pagingEnabled
                    onMomentumScrollEnd={this.onScrollEnd}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        )
    }

    renderItem = ({ item, index }: { item: Need, index: number }) => {
        let { width, height } = Dimensions.get('window');

        return (
            <View style={StyleSheet.flatten([styles.cardItem, { width: width - 20 }])}>
                <CalloutView need={item} />
            </View >
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

    onPressNeedMarker = (e) => {
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
                    showsUserLocation={true}
                >
                    {this.renderNeeds()}
                </MapView>
                <View style={{
                    left: 0,
                    right: 0,
                    top: 10,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'absolute'
                }}>
                    <View style={{
                        height: 0,
                        flexDirection: 'row',
                        alignContent: 'space-around',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        marginLeft: 10,
                        marginRight: 10
                    }}>
                        <View style={{
                            flex: 1,
                            marginRight: 20,
                            marginLeft: 20,
                            height: 0,
                        }} />
                        <TouchableOpacity activeOpacity={0.9}
                            onPress={() => this.onPressActionButton('FILTER')}
                            style={StyleSheet.flatten([styles.actionButton, styles.actionButtonFilter])}>
                            <FAIcon name="filter" size={15} style={styles.actionButtonIcon} />
                            <Text style={styles.actionButtonText}> FILTER </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.cardSheet}>
                    <View style={styles.actionButtonContainer}>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => this.onPressActionButton('HAVE')}
                            style={StyleSheet.flatten([styles.actionButton, styles.actionButtonNeed])}>
                            <EntypoIcon name="edit" size={15} style={styles.actionButtonIcon} />
                            <Text style={styles.actionButtonText}>HAVE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.9} onPress={() => this.onPressActionButton('NEED')}
                            style={StyleSheet.flatten([styles.actionButton, styles.actionButtonNeed])}>
                            <EntypoIcon name="edit" size={15} style={styles.actionButtonIcon} />
                            <Text style={styles.actionButtonText}>NEED</Text>
                        </TouchableOpacity>
                    </View>

                    {this.renderNeedCardView()}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    cardSheet: {
        left: 0,
        right: 0,
        bottom: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'absolute'
    },
    cardWrapper: {
        flex: 1,
        height: 225,
    },
    cardItem: {
        flex: 1,
        marginRight: 10,
        marginLeft: 10,
        borderRadius: 6,
        backgroundColor: "#fff",
    },
    actionButtonContainer: {
        height: 44,
        flexDirection: 'row',
        alignContent: 'space-around',
        justifyContent: 'space-between',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10
    },
    actionButton: {
        height: 40,
        flex: 1,
        backgroundColor: 'green',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 50,
        marginRight: 20,
        marginLeft: 20,
    },
    actionButtonIcon: {
        color: "#FFF",
        marginRight: 5
    },
    actionButtonFilter: {
        backgroundColor: '#FF5A5F',
    },
    actionButtonNeed: {
        backgroundColor: '#0080FE',
    },
    actionButtonText: {
        color: 'white'
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
