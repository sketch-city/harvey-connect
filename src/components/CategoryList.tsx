import React, { Component } from 'react';
import { View, Text, SectionList, TouchableOpacity } from 'react-native';
import { Separator } from './Separator'
interface Props {
    closeButtonTapped: () => void,
    itemSelected: (item: string) => void
}
export class CategoryList extends Component<Props, {}> {
    renderItem = ({ item, index }: { item: string, index: number }) => {
        return (
            <TouchableOpacity style={{
                height: 40,
                padding: 10,
                backgroundColor: 'green'
            }}
                onPress={() => this.props.itemSelected(item)}>
                <Text>{item}</Text>
            </TouchableOpacity>
        )
    }
    renderHeader = (item) => {
        return (
            <Text style={{ height: 25, padding: 10, paddingLeft: 15 }}>{item.section.key}</Text>
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
                    <Text style={{ color: 'white' }}>Close</Text>
                </TouchableOpacity>
                <SectionList
                    renderItem={this.renderItem}
                    renderSectionHeader={this.renderHeader}
                    ItemSeparatorComponent={Separator}
                    sections={[
                        { data: ['123', '456', '789'], key: 'numbers', keyExtractor: this.keyExtractor },
                        { data: ['abc', 'def', 'ghi'], key: 'letters', keyExtractor: this.keyExtractor },
                        { data: ['123', 'abc', '456'], key: 'both', keyExtractor: this.keyExtractor }
                    ]}
                />
            </View>
        )
    }
}