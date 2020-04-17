import React, { Component } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Need, API } from '../API/API';
import { Separator } from '../components/Separator';
import FAIcon from 'react-native-vector-icons/FontAwesome';

import Communications from 'react-native-communications';
import { Linking, Platform, Alert } from 'react-native';

import {
  TitleText,
  PlainText,
  ButtonText,
  Colors,
  dropShadowStyles,
} from '../constants';
import { strings } from '../localization/Strings';

import _ from 'lodash';
import Mailer from 'react-native-mail';

interface Props {
  need?: Need;
  localizedCategories: {};
  needFlagged?: () => void;
}
interface State {}

export class CardView extends Component<Props, State> {
  constructor(props) {
    super(props);
  }

  onPressDirections = () => {
    const { need } = this.props;
    if (!need.latitude || !need.longitude) {
      return false;
    }
    let url = this.directionsURL(need.latitude, need.longitude);
    Linking.openURL(url).catch((err) =>
      console.error('An error occurred', err)
    );
  };

  directionsURL = (latitude: number, longitude: number) => {
    let provider = Platform.OS;
    let link = {
      android: `http://maps.google.com/maps?saddr&daddr=${latitude},${longitude}`,
      ios: `http://maps.apple.com/?saddr=&daddr=${latitude},${longitude}`,
    };

    return link[provider];
  };

  renderCategories() {
    // const categories = _.chain(this.props.need.categories).values().flatten().compact().value()
    // if (categories.length === 0) {
    //     return 'N/A'
    // }

    // return _.reduce(categories, (result, value: string, index) => {
    //     let localized = this.props.localizedCategories[value]
    //     if (localized === undefined || localized === null || localized === '') {
    //         localized = value
    //     }
    //     if (index === (categories.length - 1)) {
    //         let andString = categories.length === 1 ? '' : 'and '
    //         return `${result}${andString}${localized.toLowerCase()}.`
    //     }

    //     return `${result}${localized.toLowerCase()},`
    // }, 'I need ')

    const { categories: cats } = this.props.need;
    const { localizedCategories: lcats } = this.props;
    const needs = Object.keys(this.props.need.categories);

    return needs.length === 0
      ? 'N/A'
      : `${lcats['categories']} ` +
          needs.map((n) => `${lcats[cats[n]]} ${lcats[n]}`).join(' and ');
  }

  flagNeedTapped = () => {
    Alert.alert(
      'Are you sure?',
      `Do you flag this post for objectionable content?`,
      [
        { text: 'OK', onPress: () => this.flagNeed(), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  flagNeed = async () => {
    if (this.props.need !== null || this.props.need !== undefined) {
      try {
        await API.flagMarker(this.props.need.id);
        Alert.alert('Done!', 'The post has been flagged.');
        if (
          this.props.needFlagged !== null &&
          this.props.needFlagged() !== undefined
        ) {
          this.props.needFlagged();
        }
      } catch (error) {
        Alert.alert('Error', 'Something went wrong, please try again.');
      }
    }
  };

  render() {
    const { need } = this.props;

    return (
      <View style={styles.cardContainer}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.needTitleText, { marginLeft: 10 }]}>
            {need.name}
          </Text>
          <TouchableOpacity onPress={this.flagNeedTapped}>
            <FAIcon
              name='flag'
              style={[
                styles.directionButtonIcon,
                { marginTop: 8, marginRight: 10 },
              ]}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.categoryListContainer}>
          <Text style={styles.categoryListText}>{this.renderCategories()}</Text>
        </ScrollView>

        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonsTop}>
            <TouchableOpacity
              onPress={this.onPressDirections}
              activeOpacity={0.6}
              style={StyleSheet.flatten(styles.actionButtonDirections)}
            >
              <FAIcon name='map-marker' style={styles.directionButtonIcon} />
              <Text style={styles.actionButtonDirectionText}>
                {strings.directionsAction}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtonsBottom}>
            <TouchableOpacity
              onPress={() => {
                Communications.phonecall(need.phone, true);
              }}
              activeOpacity={0.6}
              style={StyleSheet.flatten([styles.actionButton])}
            >
              <Text style={styles.actionButtonText}>
                {strings.phoneCallAction}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Communications.text(need.phone);
              }}
              activeOpacity={0.6}
              style={{
                ...StyleSheet.flatten([styles.actionButton]),
                borderLeftWidth: StyleSheet.hairlineWidth,
                borderLeftColor: Colors.white,
              }}
            >
              <Text style={styles.actionButtonText}>{strings.smsAction}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const { width, height } = Dimensions.get('window');
const cardBorderRadius = 16;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width - 20,
    marginLeft: 10,
    marginRight: 10,
    height: 200,
    borderRadius: cardBorderRadius,
    backgroundColor: '#FFF',
    ...dropShadowStyles,
  },
  needTitleText: {
    ...TitleText,
    textAlign: 'left',
    width: width - 65,
    height: 40,
    marginTop: 8,
  },
  categoryListContainer: {
    width: width - 60,
    height: 60,
  },
  categoryListText: {
    ...PlainText,
    textAlign: 'left',
    paddingTop: 1,
    paddingLeft: 5,
    paddingRight: 5,
    marginRight: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  actionButtonsContainer: {
    backgroundColor: 'red',
    height: 90,
    alignContent: 'space-around',
    justifyContent: 'space-between',
    marginTop: 10,
    overflow: 'hidden',
    width: width - 20,
    borderBottomLeftRadius: cardBorderRadius,
    borderBottomRightRadius: cardBorderRadius,
  },
  actionButtonsTop: {
    borderTopWidth: 0.5,
    borderTopColor: '#F3F3F3',
    height: 45,
  },
  actionButtonsBottom: {
    flex: 1,
    backgroundColor: '#50E3C2',
    flexDirection: 'row',
    height: 45,
    overflow: 'hidden',
    width: width - 20,
  },
  actionButtonText: {
    ...ButtonText,
    color: 'white',
  },
  actionButtonDirections: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  actionButtonDirectionText: {
    ...ButtonText,
    color: Colors.grey,
  },
  directionButtonIcon: {
    marginRight: 5,
    fontSize: 32,
    color: Colors.grey,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
