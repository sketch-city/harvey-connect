import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { API, Need } from '../API/API'
import { CalloutView } from './CalloutView'
import PageControl from 'react-native-page-control';
let MapView = require('react-native-maps');

interface Props {
}

interface State {
    needs: Need[]
    currentPage: number
}
export class MainView extends Component<Props, State> {
    intervalId: number;

    constructor(props) {
        super(props);
        this.state = {
            needs: [],
            currentPage: 0
        }
    }

    componentDidMount() {
        this.getNeeds()
    }

    async getNeeds() {
        let needs = await API.getNeeds();
        if (needs !== undefined || needs !== null) {
            this.setState({ needs: needs })
        }
    }

    renderItem = ({ item, index }: { item: string, index: number }) => {
        let { width, height } = Dimensions.get('window');
        console.log(`width ${width}, height: ${height}`);
        return (
            <View style={[styles.cardItem, { width: width - 20}]}>
                <CalloutView />
            </View >
        )
    };

    keyExtractor = (_: string, index: number): string => {
        return `${index}`
    };

    onScrollEnd = (e) => {
        let contentOffset = e.nativeEvent.contentOffset;
        let viewSize = e.nativeEvent.layoutMeasurement;

        let pageNum = Math.floor(contentOffset.x / viewSize.width);
        this.setState({ currentPage: pageNum })
    };

    render() {
        let height = Dimensions.get('window').height;
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
                    {this.state.needs.filter(marker => { return marker.latitude !== null && marker.longitude !== null }).map(marker => (
                        <MapView.Marker
                            pinColor={marker.areVolunteersNeeded ? 'red' : 'blue'}
                            coordinate={{
                                latitude: marker.latitude,
                                longitude: marker.longitude
                            }}
                            title={marker.updatedBy}
                            description={marker.tellUsAboutSupplyNeeds}
                            key={marker.timestamp}
                        />
                    ))}
                </MapView>
                <View style={[styles.cardSheet, { height: height/3.0 }]}>
                    <View style={styles.cardWrapper}>
                        <FlatList data={['Wheelbarrow', 'Labor', 'Labor']}
                            renderItem={this.renderItem}
                            keyExtractor={this.keyExtractor}
                            horizontal={true}
                            pagingEnabled={true}
                            onMomentumScrollEnd={this.onScrollEnd}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                    <View style={styles.actionButtonContainer}>
                        <TouchableOpacity activeOpacity={0.9} style={[styles.actionButton, styles.actionButtonLeft]}>
                            <Text style={styles.actionButtonText}>Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.9} style={[styles.actionButton, styles.actionButtonRight]}>
                            <Text style={styles.actionButtonText}>Text</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <PageControl
                    style={styles.pageControl}
                    numberOfPages={3}
                    currentPage={this.state.currentPage}
                    pageIndicatorTintColor='gray'
                    currentPageIndicatorTintColor='red'
                    indicatorStyle={{ borderRadius: 5 }}
                    currentIndicatorStyle={{ borderRadius: 5 }}
                    indicatorSize={{ width: 8, height: 8 }}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    cardSheet: {
        left: 0,
        right: 0,
        bottom: 10,
        height: 240,
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'absolute'
    },
    cardWrapper: {
        flex: 1
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
        height: 44,
        flex: 1,
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 7
    },
    actionButtonLeft: {
        marginRight: 10,
    },
    actionButtonRight: {
        marginLeft: 10,
    },
    actionButtonText: {
        color: 'white'
    },
    pageControl: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 74
    },
    pageControlIndicator: {
        borderRadius: 5
    }
});
