import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { API, Need, Category, Marker, CreateMarker } from '../API/API'
import { CalloutView } from './CalloutView'
import PageControl from 'react-native-page-control';
var MapView = require('react-native-maps')

interface Props {
}

interface State {
    needs: Need[]
    categories: Category[]
    currentPage: number
}
export class MainView extends Component<Props, State> {
    intervalId: number;

    constructor(props) {
        super(props);
        this.state = {
            needs: [],
            categories: [],
            currentPage: 0
        }
    }

    componentDidMount() {
        this.getNeeds()
        this.getCategories()
    }

    async getCategories() {
        let categories = await API.getCategories()
        if (categories !== undefined || categories !== null) {
            this.setState({ categories: categories })
        }
    }

    async getNeeds() {
        let needs = await API.getNeeds()
        if (needs !== undefined || needs !== null) {
            this.setState({ needs: needs })
        }
    }

    renderItem = ({ item, index }: { item: string, index: number }) => {
        let { width, height } = Dimensions.get('window')
        return (
            <View style={{
                width: width - 20,
                height: 200,
                marginRight: 10,
                marginLeft: 10,
                borderRadius: 6,
                backgroundColor: "#fff",
            }}>
                <CalloutView />
            </View >
        )
    }

    keyExtractor = (_: string, index: number): string => {
        return `${index}`
    }

    onScrollEnd = (e) => {
        let contentOffset = e.nativeEvent.contentOffset;
        let viewSize = e.nativeEvent.layoutMeasurement;

        let pageNum = Math.floor(contentOffset.x / viewSize.width);
        this.setState({ currentPage: pageNum })
    }

    render() {
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
                    {this.state.needs.map(marker => (
                        <MapView.Marker
                            pinColor={marker.markerType === 'need' ? 'red' : 'blue'}
                            coordinate={{
                                latitude: marker.latitude,
                                longitude: marker.longitude
                            }}
                            title={marker.category}
                            description={marker.description}
                            key={marker.id}
                        >
                        </MapView.Marker>
                    ))}
                </MapView>
                <View style={{
                    left: 0,
                    right: 0,
                    top: 400,
                    bottom: 50,
                    position: 'absolute'
                }}>

                    <FlatList data={['Wheelbarrow', 'Labor', 'Labor']}
                        renderItem={this.renderItem}
                        keyExtractor={this.keyExtractor}
                        horizontal={true}
                        pagingEnabled={true}
                        onMomentumScrollEnd={this.onScrollEnd}
                        showsHorizontalScrollIndicator={false}
                    />
                    < View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignContent: 'space-around',
                        justifyContent: 'space-between',
                        backgroundColor: 'red',
                        marginTop: 10,
                        marginLeft: 10,
                        marginRight: 10
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
                            <Text style={{ color: 'white' }}>Call</Text>
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
                            <Text style={{ color: 'white' }}>Text</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <PageControl
                    style={{ position: 'absolute', left: 0, right: 0, bottom: 75 }}
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