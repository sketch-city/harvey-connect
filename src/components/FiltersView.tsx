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

interface Props {
  onCancel()
  onSelectFilters()
}

interface State {}

export class FiltersView extends Component<Props, State> {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
              <Text> This is filter view </Text>
            </View >
        )
    }
}
