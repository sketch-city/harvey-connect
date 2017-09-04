import React, { Component } from 'react';
import { View, Text, TextInput, KeyboardTypeIOS, KeyboardType } from 'react-native';
interface Props {
    placeholder: string,
    value?: string,
    keyboardType?: KeyboardType | KeyboardTypeIOS
}
export class TextCell extends Component<Props, {}> {
    render() {
        return (
            <TextInput placeholder={this.props.placeholder}
                value={this.props.value}
                keyboardType={this.props.keyboardType}
                multiline={false}
                style={{ height: 45 }}></TextInput>
        )
    }
}