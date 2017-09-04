import React, { Component } from 'react';
import { View, Text, SectionList, TouchableOpacity } from 'react-native';
import { Separator } from './Separator'
interface Props {
    closeButtonTapped: (items: { key: string, item: string, index: number }[]) => void,
    itemSelected: (item: string) => void
}

interface State {
    selectedIndices: { key: string, item: string, index: number }[]
    data: { data: any[], key: any, keyExtractor: any }[]
}
export class CategoryList extends Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            selectedIndices: [],
            data: [
                { data: ['muck', 'heavy trash', 'laundry'], key: 'labor', keyExtractor: this.keyExtractor },
                { data: ['Nurse, medical doctor', 'House repairs', 'Legal advice'], key: 'specialized', keyExtractor: this.keyExtractor },
                { data: ['construction', 'baby and child care', 'medicine'], key: 'supplies', keyExtractor: this.keyExtractor }
            ]

        }
    }
    itemSelected = (key: string, index: number) => {
        return this.state.selectedIndices.filter((firstVal) => firstVal.key === key && firstVal.index === index).length > 0
    }

    renderItem = ({ item, index, section }: { item: string, index: number, section: any }) => {
        return (
            <TouchableOpacity style={{
                height: 40,
                padding: 10,
                backgroundColor: this.itemSelected(section.key, index) ? 'green' : 'white'
            }}
                onPress={() => {
                    if (this.itemSelected(section.key, index)) {
                        let current = [...this.state.selectedIndices]

                        let foundIndex = current.findIndex((val) => val.key === section.key && val.index === index)
                        current.splice(foundIndex, 1)
                        this.setState({ selectedIndices: current })
                    } else {
                        let current = [...this.state.selectedIndices]

                        current.push({ key: section.key, item: item, index: index })
                        this.setState({ selectedIndices: current })
                    }
                }}>
                <Text style={{ color: this.itemSelected(section.key, index) ? 'white' : 'black' }}>{item}</Text>
            </TouchableOpacity>
        )
    }
    renderHeader = (item) => {
        return (
            <Text style={{ height: 25, padding: 10, paddingLeft: 15, marginBottom: 10 }}>{item.section.key}</Text>
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
                    backgroundColor: 'green',
                    width: 75,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 4,
                }}
                    onPress={this.props.closeButtonTapped}>
                    <Text style={{ color: 'white' }}>Save</Text>
                </TouchableOpacity>
                <SectionList
                    renderItem={this.renderItem}
                    renderSectionHeader={this.renderHeader}
                    ItemSeparatorComponent={Separator}
                    sections={this.state.data}
                    extraData={this.state.selectedIndices}
                />
            </View>
        )
    }
}