import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import MapView from 'react-native-maps';
import AsyncStorage from '@react-native-community/async-storage';

import {
  API,
  Need,
  KeyedCollection,
  Marker,
  CreateMarker,
  IKeyedCollection,
} from '../API/API';
import {TextCell} from './TextCell';
import {ButtonCell} from './ButtonCell';
import {CategoryList} from './CategoryList';
import {UUIDHelper} from './../API/UUIDHelper';
import {Separator} from './Separator';
import {Colors, SmallButtonText} from '../constants';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import {strings} from './../localization/Strings';
import _ from 'lodash';

interface Props {
  categories: KeyedCollection<any>;
  filters: string[];
  onSelectFilters([]);
  onCancel();
}

interface State {
  activeFilter: string;
  categoryJSON: Object;
}

const styles = StyleSheet.create({
  filtersListContainer: {
    paddingTop: 20,
    flex: 1,
    alignItems: 'center',
  },

  filtersListHeader: {
    width: Dimensions.get('window').width,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#A2AEB6',
  },

  filtersList: {
    flex: 1,
    width: Dimensions.get('window').width,
  },

  filtersListHeaderText: {
    fontSize: 24,
  },

  filtersListItem: {
    height: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    borderBottomColor: '#A2AEB6',
    borderBottomWidth: 0.5,
  },

  filterListItemText: {
    color: '#A2AEB6',
  },

  filterListItemTextActive: {
    color: 'black',
  },

  activeFilterCheckMark: {
    color: 'black',
  },

  // footer
  filtersListFooter: {
    height: 50,
    backgroundColor: '#50E3C2',
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width,
  },
  filterListFooterText: {
    ...SmallButtonText,
  },
});

export class FiltersView extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.getCategoryJSON();
    this.state = {
      activeFilter: this.props.filters[0] || strings.anything,
      categoryJSON: undefined,
    };
  }

  onPressFilter(filterName, e) {
    this.setState({
      activeFilter: filterName,
    });
  }

  getCategoryJSON = async () => {
    try {
      let cats = await AsyncStorage.getItem('categories');
      let json = JSON.parse(cats);

      this.setState({categoryJSON: json});
    } catch (error) {
      console.log(error);
    }
  };
  onPressDone() {
    const selectedFilters =
      this.state.activeFilter === strings.anything ? [] : [this.state.activeFilter];

    this.props.onSelectFilters(selectedFilters);
  }

  renderItem({item, index}) {
    const isActiveFilter = item.name === this.state.activeFilter;

    return (
      <TouchableOpacity
        style={styles.filtersListItem}
        onPress={this.onPressFilter.bind(this, item.name)}>
        <View>
          <Text
            style={StyleSheet.flatten([
              styles.filterListItemText,
              isActiveFilter && styles.filterListItemTextActive,
            ])}>
            {this.getCategoryName(item)}
          </Text>
          <Text style={styles.filterListItemText} numberOfLines={1}>
            {this.getCategoryDescriptor(item)}
          </Text>
        </View>
        {isActiveFilter && (
          <FAIcon name="check" size={15} style={styles.activeFilterCheckMark} />
        )}
      </TouchableOpacity>
    );
  }

  getCategoryName = (item) => {
    if (this.state.categoryJSON === undefined) {
      return '';
    }

    let lang = strings.getLanguage();
    if (lang !== 'es' && lang !== 'en' && lang !== 'hi') {
      lang = 'en';
    }

    let catName = item.name.toLowerCase();

    let value = this.state.categoryJSON[lang][catName];
    
    if(value === undefined){
      value = strings.anything
    }

    return value;
  };

  getCategoryDescriptor = (item) => {
    if (this.state.categoryJSON === undefined) {
      return '';
    }

    let lang = strings.getLanguage();
    if (lang !== 'es' && lang !== 'en' && lang !== 'hi') {
      lang = 'en';
    }
    let cats = this.props.categories.items[item.name.toLowerCase()];
    if (cats !== undefined) {
      let str = '';
      for (let i = 0; i < Math.min(3, cats.length); i++) {
        let key = Object.keys(cats[i])[0];
        let value = this.state.categoryJSON[lang][key];
        str += value + ', ';
      }
      return str.slice(0, str.length - 2);
    } else {
      return '';
    }
  };

  getOrderedCategoriesList() {
    const categories = _.map(this.props.categories.items, (item, keyName) => {
      return {
        name: _.capitalize(keyName),
        key: keyName,
      };
    });

    return [{name: strings.anything, key: 'anything'}, ...categories];
  }

  render() {
    return (
      <View style={styles.filtersListContainer}>
        <View style={styles.filtersListHeader}>
          <Text style={styles.filtersListHeaderText}>
            {strings.filterSelectionTitle}
          </Text>
        </View>

        <View style={styles.filtersList}>
          <FlatList
            data={this.getOrderedCategoriesList()}
            renderItem={this.renderItem.bind(this)}
          />
        </View>

        <TouchableOpacity
          style={styles.filtersListFooter}
          onPress={this.onPressDone.bind(this)}>
          <Text style={styles.filterListFooterText}>{strings.doneAction}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
