import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { strings } from '../localization/Strings';
import { SegmentedControls } from 'react-native-radio-buttons';

const enum Option {
    MatchedNeeds,
    MatchedHaves
}

interface State {
    selectedOption: Option
}
export class MatchesView extends Component<{}, State> {

    state = { selectedOption: Option.MatchedNeeds }

    setSelectedOption(opt: Option){
        this.setState({
          selectedOption: opt
        });
    }

    renderOption(option, selected, onSelect, index){
        const style = selected ? { fontWeight: 'bold'} : {};

        return (
            <TouchableWithoutFeedback onPress={onSelect} key={index}>
                <Text style={style}>{option}</Text>
            </TouchableWithoutFeedback>
        );
      }

    render() {
        return (
            <View style={styles.container}>
                <SegmentedControls
                options={ [Option.MatchedNeeds, Option.MatchedHaves] }
                extractText={ (opt: Option) => {
                    switch (opt) {
                        case Option.MatchedNeeds: return strings.HelpForMe
                        case Option.MatchedHaves: return strings.ICanHelp
                    }}
                }
                onSelection={ this.setSelectedOption.bind(this) }
                selectedOption={ this.state.selectedOption }/>
                <Text>{ this.state.selectedOption === Option.MatchedHaves ? "Give Something" : "Get Something" }</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    description: {
      marginBottom: 20,
      fontSize: 18,
      textAlign: 'center',
      color: '#656565'
    },
    container: {
      padding: 30,
      marginTop: 0,
      alignItems: 'center'
    },
  });
