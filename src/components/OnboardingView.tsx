import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Colors, styles} from '../constants';
import {strings} from '../localization/Strings';

interface Props {
  cancelTapped: () => void;
}
interface State {}

const localStyles = StyleSheet.create({
  infoLabel: {
    flex: 1,
    color: Colors.needText,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0)',
    alignSelf: 'center',
    marginHorizontal: 20,
    textAlign: 'center',
  },
  scrollView: {
    top: 0,
    bottom: 64,
    left: 0,
    right: 0,
  },
});

export class OnboardingView extends Component<Props, State> {
  constructor(props) {
    super(props);
  }

  render() {
    const {width, height} = Dimensions.get('window');
    return (
      <ScrollView style={{flex: 1}}>
        <View
          style={{
            flex: 1,
            justifyContent: 'space-around',
            alignItems: 'center',
          }}>
          <Image
            source={require('./../images/logo.png')}
            style={{width: 105, height: 155, marginTop: 30}}
            resizeMode={'center'}
          />
          <View
            style={{
              flex: 1,
              height: 1,
              marginHorizontal: 10,
              backgroundColor: Colors.separatorColor,
            }}
          />
          <View
            style={{
              width: width - 20,
              height: 1,
              marginTop: 10,
              backgroundColor: Colors.separatorColor,
            }}
          />
          <Image
            source={require('./../images/I_need.png')}
            style={{height: 100, width: 150}}
            resizeMode={'center'}
          />
          <Text style={localStyles.infoLabel}>
            If you need help recovering from a disaster, tap 'I NEED' to
            register your request.
          </Text>
          <View
            style={{
              width: width - 20,
              height: 1,
              marginBottom: 10,
              marginTop: 10,
              backgroundColor: Colors.separatorColor,
            }}
          />
          <Image
            source={require('./../images/card.png')}
            style={{height: 200, width: 350}}
            resizeMode={'center'}
          />
          <Text
            style={StyleSheet.flatten([
              localStyles.infoLabel,
              {marginTop: 10},
            ])}>
            If you want to volunteer to help someone near you, select a pin on
            the map to contact them.
          </Text>
        </View>
        <View
          style={{
            ...StyleSheet.flatten([styles.actionButtonContainer]),
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,0)',
          }}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={this.props.cancelTapped}
            style={StyleSheet.flatten([
              styles.actionButton,
              styles.actionButtonFilter,
            ])}>
            <Text style={styles.actionButtonText}>
              {strings.doneAction.toLocaleUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}
