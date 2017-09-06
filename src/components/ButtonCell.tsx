import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from './Colors'

interface Props {
    buttonTitle: string,
    value?: string,
    onButtonPress: () => void
}
export class ButtonCell extends Component<Props, {}> {
    render() {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <TouchableOpacity style={{
                    height: 40,
                    backgroundColor: Colors.darkblue,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                    borderRadius: 7,
                    marginRight: 10
                }}
                    onPress={this.props.onButtonPress}
                >
                    <Text style={{color:'#fff'}} >{this.props.buttonTitle}</Text>
                </TouchableOpacity>
                <Text>{this.props.value}</Text>
            </View>
        )
    }
}