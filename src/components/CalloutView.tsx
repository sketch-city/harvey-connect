import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
interface Props { }
interface State { }
export class CalloutView extends Component<Props, State> {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View style={{ width: 160, height: 100 }}>
                <Text>this is some text</Text>
                <TouchableOpacity>
                    <Text></Text>
                </TouchableOpacity>
            </View>

        )
    }
}