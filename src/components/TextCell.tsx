import React, { Component } from 'react';
import { View, Text, TextInput, KeyboardTypeIOS, KeyboardType } from 'react-native';
import {MarkerValue} from './HavesView'
interface Props {
    placeholder: string,
    value?: string,
    keyboardType?: KeyboardType | KeyboardTypeIOS,
    markerValue:MarkerValue,
    textChanged:(text:string, markerValue:MarkerValue) => void

}
export class TextCell extends Component<Props, {}> {
    render() {
        return (
            <TextInput placeholder={this.props.placeholder}
                value={this.props.value}
                keyboardType={this.props.keyboardType}
                multiline={false}
                style={{ height: 45 }}
                onChangeText={(text) => this.props.textChanged(text,this.props.markerValue)}
                ></TextInput>
        )
    }
}