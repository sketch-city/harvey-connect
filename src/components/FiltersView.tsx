import React, { Component } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Alert,
    StyleSheet
} from 'react-native';
import MapView from 'react-native-maps'

import { API, Need, KeyedCollection, Marker, CreateMarker, IKeyedCollection } from '../API/API'
import { TextCell } from './TextCell'
import { ButtonCell } from './ButtonCell'
import { CategoryList } from './CategoryList';
import { UUIDHelper } from './../API/UUIDHelper'
import { Separator } from "./Separator";
import FAIcon from 'react-native-vector-icons/FontAwesome';

import _ from 'lodash';

interface Props {
    categories: KeyedCollection<any>
    filters: string[]
    onSelectFilters([])
    onCancel()
    onSelectFilters()
}

interface State {
    activeFilter: string
}

const styles = StyleSheet.create({
    filtersListContainer: {
        paddingTop: 20,
        flex: 1,
        alignItems: 'center',
    },

    filtersListHeader: {
        width: Dimensions.get('window').width,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: '#A2AEB6',
    },

    filtersList: {
        flex: 1,
        width: Dimensions.get('window').width,
    },

    filtersListHeaderText: {
        fontSize: 24,
    },

    filtersListItem: {
        height: 40,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        borderBottomColor: '#A2AEB6',
        borderBottomWidth: 0.5,
    },

    filterListItemText: {
        color: '#A2AEB6'
    },

    filterListItemTextActive: {
        color: 'black'
    },

    activeFilterCheckMark: {
        color: 'black'
    },

    // footer
    filtersListFooter: {
        height: 50,
        backgroundColor: '#50E3C2',
        alignItems: 'center',
        justifyContent: 'center',
        width: Dimensions.get('window').width,
    },
    filterListFooterText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    }
})

export class FiltersView extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            activeFilter: this.props.filters[0] || 'Anything'
        }
    }

    onPressFilter (filterName, e) {
        this.setState({
            activeFilter: filterName
        })
    }

    onPressDone () {
        const selectedFilters= this.state.activeFilter === 'Anything'
            ? []
            : [this.state.activeFilter]

        this.props.onSelectFilters(selectedFilters)
    }

    renderItem ({item, index}) {
        const isActiveFilter = (item.name === this.state.activeFilter)

        return (
            <TouchableOpacity style={[styles.filtersListItem]} onPress={this.onPressFilter.bind(this, item.name)}>
                <Text style={[styles.filterListItemText, isActiveFilter && styles.filterListItemTextActive]}>{item.name}</Text>
                {isActiveFilter &&
                    <FAIcon name="check" size={15} style={styles.activeFilterCheckMark} />
                }
            </TouchableOpacity>
        )
    }

    getOrderedCategoriesList () {
        const categories = _.map(this.props.categories.items, (item, keyName) => {
            return {
                name: _.capitalize(keyName),
                key: keyName,
            }
        })

        return [
            { name: 'Anything', key: 'anything' },
            ...categories
        ]
    }

    render() {
        return (
            <View style={styles.filtersListContainer}>
                <View style={styles.filtersListHeader}>
                    <Text style={styles.filtersListHeaderText}> Show some people who need...</Text>
                </View>

                <View style={styles.filtersList}>
                    <FlatList
                        data={this.getOrderedCategoriesList()}
                        renderItem={this.renderItem.bind(this)}
                    />
                </View>

                <TouchableOpacity style={styles.filtersListFooter} onPress={this.onPressDone.bind(this)}>
                    <Text style={styles.filterListFooterText}> Done </Text>
                </TouchableOpacity>
            </View >
        )
    }
}
