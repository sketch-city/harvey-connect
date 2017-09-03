import React, { Component } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Need } from '../API/API'
import { Separator } from '../components/Separator'
interface Props {
    need?: Need
}
interface State { }
export class CalloutView extends Component<Props, State> {

    constructor(props) {
        super(props)
    }

    renderItem = ({ item, index }: { item: string, index: number }) => {
        return (
            <View style={{
                height: 40,
                justifyContent: 'center',
                backgroundColor: 'white'
            }}>
                <Text style={{ marginLeft: 10 }}>{item}</Text>
            </View>
        )
    }

    keyExtractor = (_: string, index: number): string => {
        return `${index}`
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: 'red' }}>
                <Text style={{
                    textAlign: 'left',
                    marginTop: 10,
                    marginBottom: 10,
                    marginLeft: 10
                }}>Needs</Text>
                <FlatList data={['Wheelbarrow', 'Labor', 'Labor']}
                    renderItem={this.renderItem}
                    keyExtractor={this.keyExtractor}
                    ItemSeparatorComponent={Separator}
                />
            </View>
        )
    }
}
