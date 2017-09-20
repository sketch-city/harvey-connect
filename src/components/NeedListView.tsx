import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Modal, Alert } from 'react-native';

import EntypoIcon from 'react-native-vector-icons/Entypo';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import _ from 'lodash';
import {
    API,
    Need,
    KeyedCollection,
    Marker,
    CreateMarker,
    IKeyedCollection
} from '../API/API'

import { ModalView } from './ModalView';
import { Separator } from "./Separator";
import { HavesView, MarkerType } from './HavesView';
import { Colors, SmallButtonText } from '../constants';
import { strings } from '../localization/Strings';


interface Props {
    cancelTapped: () => void
}

interface State {
    markers: Need[],
    modalVisible: boolean,
    selectedNeed: Need
}

export class NeedListView extends Component<Props, State> {

    constructor(props) {
        super(props)
        this.state = {
            markers: [],
            modalVisible: false,
            selectedNeed: null
        }
    }

    getMarkers = async () => {
        try {
            let markers = await API.getMyMarkers()
            this.setState({ markers: markers })
        } catch (error) {

        }

    }
    componentDidMount() {
        this.getMarkers()
    }

    itemSelected = (item: Need) => {
        this.setState({ modalVisible: true, selectedNeed: item })
    }

    renderItem = ({ item, index }: { item: Need, index: number }) => {
        let width = Dimensions.get('window').width
        return (
            <TouchableOpacity style={{ height: 75, justifyContent: 'center' }}
                onPress={() => this.itemSelected(item)}>


                <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 75, alignItems: 'center' }}>
                    <FAIcon name={'map-marker'} size={20} style={{ color: '#A2AEB6', marginLeft: 10, marginRight: 10 }} />
                    <View style={{ flex: 1, height: 75, alignContent: 'center', justifyContent: 'center' }}>
                        <Text style={{ width: width - 65, color: Colors.needText, marginBottom: 2 }}>
                            {item.name}</Text>
                        <Text style={{ width: width - 65, color: Colors.needText, marginTop: 2 }}
                            numberOfLines={2}>{item.address}</Text>
                    </View>

                    <FAIcon name={'angle-right'} size={20} style={{ color: '#A2AEB6', marginLeft: 10, marginRight: 10 }} />
                </View>
            </TouchableOpacity>
        )
    }

    keyExtractor = (_: string, index: number): string => {
        return `${index}`
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Modal visible={this.state.modalVisible} animationType={'slide'} onRequestClose={this.props.cancelTapped}>
                    <HavesView cancelTapped={() => {
                        this.setState({ modalVisible: false });
                        this.getMarkers();
                    }}
                        markerType={MarkerType.Need}
                        editingNeed={this.state.selectedNeed} />
                </Modal>
                <View style={{
                    height: 60,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Text style={{ color: Colors.needText, fontWeight: '600', marginTop: 10 }}>{strings.myNeedsListTitle}</Text>
                </View>
                <View style={{ height: 1, backgroundColor: Colors.separatorColor }} />
                <FlatList data={this.state.markers}
                    ItemSeparatorComponent={Separator}
                    renderItem={this.renderItem}
                    keyExtractor={this.keyExtractor} />
                <View style={{ height: 1, backgroundColor: Colors.separatorColor }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 45
                    }}
                        onPress={this.props.cancelTapped} >
                        <Text style={{ ...SmallButtonText, color: '#A2AEB6' }}>{strings.doneAction}</Text>
                    </TouchableOpacity>
                    <View style={{ height: 45, width: 1, backgroundColor: Colors.separatorColor }}></View>
                    <TouchableOpacity style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#50E3C2',
                        height: 45
                    }}
                        onPress={() => this.setState({ modalVisible: true, selectedNeed: undefined })}>
                        <Text style={ SmallButtonText }>{strings.createNeedAction}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}