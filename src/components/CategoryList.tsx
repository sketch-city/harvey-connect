import React, { Component } from 'react';
import { View, Text, SectionList, TouchableOpacity } from 'react-native';
import { Separator } from './Separator';
import { Colors } from '../constants';

interface Props {
    closeButtonTapped: ({ }) => void,
    itemSelected: (item: string) => void,
    selectedCategories?: {}

}
export class Category extends Object {
    data: string[]
    key: any
    keyExtractor: any
    renderItem: any

    constructor(key: string, values: any[], keyExtractor: any, renderItem: any) {
        super();
        this.key = key;
        this.data = values;
        this.keyExtractor = keyExtractor;
        this.renderItem = renderItem
    }
}
interface State {
    selectedItems: {},
    data: { data: string[], key: any, keyExtractor: any }[]
}
export class CategoryList extends Component<Props, State> {
    constructor(props) {
        super(props)
        console.log(props.selectedCategories)
        this.state = {
            selectedItems: props.selectedCategories ? props.selectedCategories : {},
            data: [
                { data: ['muck', 'heavy trash', 'laundry'], key: 'labor', keyExtractor: this.keyExtractor },
                { data: ['Nurse, medical doctor', 'House repairs', 'Legal advice'], key: 'specialized', keyExtractor: this.keyExtractor },
                { data: ['construction', 'baby and child care', 'medicine'], key: 'supplies', keyExtractor: this.keyExtractor }
            ]

        }
    }

    itemSelected = (key: string, item: string) => {
        let items = this.state.selectedItems[key]
        if (items !== null && items !== undefined) {
            return items.filter((firstVal) => firstVal === item).length > 0
        } else {
            return false
        }
    }

    renderItem = ({ item, index, section }: { item: string, index: number, section: any }) => {
        return (
            <TouchableOpacity style={{
                height: 40,
                padding: 10,
                backgroundColor: this.itemSelected(section.key, item) ? 'green' : 'white'
            }}
                onPress={() => {
                    if (this.itemSelected(section.key, item)) {
                        let current = { ...this.state.selectedItems }
                        let items = current[section.key]
                        let foundIndex = items.findIndex((val) => val === item)
                        items.splice(foundIndex, 1)
                        if (items.length === 0) {
                            delete current[section.key]
                        }
                        this.setState({ selectedItems: current })
                    } else {
                        let current = { ...this.state.selectedItems }

                        let array = current[section.key] ? current[section.key] : []
                        array.push(item)
                        current[section.key] = array
                        this.setState({ selectedItems: current })
                    }
                }}>
                <Text style={{ color: this.itemSelected(section.key, item) ? 'white' : 'black' }}>{item}</Text>
            </TouchableOpacity>
        )
    }
    renderHeader = (item) => {
        return (
            <Text style={{
                height: 30, padding: 10, marginBottom: 10,
                color: Colors.darkblue, backgroundColor: '#F5F5F5',
                fontWeight: 'bold'
            }}>{item.section.key}</Text>
        )
    }

    keyExtractor = (_: string, index: number): string => {
        return `${index}`
    }

    render() {

        return (
            <View style={{ flex: 1, marginTop: 20 }}>
                <TouchableOpacity style={{
                    marginLeft: 10,
                    height: 40,
                    marginBottom: 10,
                    backgroundColor: 'green',
                    width: 75,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 4,
                }}
                    onPress={() => this.props.closeButtonTapped(this.state.selectedItems)}
                >
                    <Text style={{ color: 'white' }}>Save</Text>
                </TouchableOpacity>
                <SectionList
                    renderItem={this.renderItem}
                    renderSectionHeader={this.renderHeader}
                    ItemSeparatorComponent={Separator}
                    sections={this.state.data}
                    extraData={this.state.selectedItems}
                />
            </View>
        )
    }
}