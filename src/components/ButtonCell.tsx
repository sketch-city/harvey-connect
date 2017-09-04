import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
                    backgroundColor: 'green',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                    borderRadius: 7,
                    marginRight: 10
                }}
                    onPress={this.props.onButtonPress}
                >
                    <Text>{this.props.buttonTitle}</Text>
                </TouchableOpacity>
                <Text>{this.props.value}</Text>
            </View>
        )
    }
}