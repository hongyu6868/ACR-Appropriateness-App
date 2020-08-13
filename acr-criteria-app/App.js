import * as React from 'react';
import { 
	Button,
	SectionList,
	ScrollView,
	Text,
	TouchableOpacity,
	View, 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SearchBar } from 'react-native-elements';
import { AppLoading } from 'expo';

const FlexSearch = require('flexsearch/flexsearch.js')
const Index = FlexSearch.create({
	tokenize: "forward",
	cache: true,
	depth: 3,
	resolution: 9,
	encode: "balance"
});
const _DELIMITER = " $$$$ "
_INDEX_TO_DOCUMENT = {}

import Criteria from './data/criteria.json';

class TableScreen extends React.Component {
	constructor(props) {
		super(props)
		this.payload = props.route.params.payload;
	}
	render() {
		const data = this.payload.recommendation_table;
		return <ScrollView style={{flex: 1, flexDirection: "column", paddingTop: 10, paddingLeft: 20, paddingRight: 20, paddingBottom: 10}}>
			<Text style={{fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center"}}>{this.payload.variant}</Text>
			{(() => {
				return data.map((item, index) => {
					let color = "#AAFFAA";
					if (item["recommendation"].indexOf("not") !== -1) {
						color = "#FFAAAA";
					}
					if (item["recommendation"].indexOf("May") !== -1) {
						color = "#FFFFAA";
					}
					return <View key={index} style={{flex: 1, paddingTop: 8, paddingBottom: 8, paddingLeft: 15, paddingRight: 15, backgroundColor: color, flexDirection: "row"}}>
						<View style={{flex: 0.5}}><Text>{item["studyName"]}</Text></View>
						<View style={{flex: 0.5}}><Text>{item["recommendation"]}</Text></View>
					</View>
				});
			})()}
			<View style={{height: 10}}></View>
			<Button title="Go Back" onPress={() => this.props.navigation.pop()}/>
		</ScrollView>
	}
}

class HomeScreen extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			query: ""
		}
	}
	_generateDataFromQuery = (query) => {
		if (!query || query.length < 2) {
			return [];
		}
		let index_keys = Index.search({
			query: query,
			suggest: true
		});
		let title_to_idx = {};
		let results = [];
		let id = 0;
		for (let i = 0; i < index_keys.length; i++) {
			let key = index_keys[i];
			let [system, complaint, variant] = _INDEX_TO_DOCUMENT[key].split(_DELIMITER)
			let title = system + " > " + complaint;
			if (!(title in title_to_idx)) {
				title_to_idx[title] = results.length
				results.push({
					id: id++,
					title: title,
					data: [{
						variant: variant,
						recommendation_table: Criteria[system][complaint][variant]
					}]
				});
			} else {
				results[title_to_idx[title]].data.push({
					variant: variant,
					recommendation_table: Criteria[system][complaint][variant]
				})
			}
		}
		return results;
	}
	_onSearchChange = (newQuery) => {
		this.setState({
			query: newQuery
		});
	}
	_onSearchClear = () => {
		this.setState({
			query: ""
		});
	}
	_renderSearchResult = ({item, index, section, separators}) => {
		return <TouchableOpacity onPress={() => {this.props.navigation.push("Table", {payload: item})}}>
			<View key={item.id} style={{flex: 1, flexDirection: "row", paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20}}>
				<Text>{item.variant}</Text>
			</View>
		</TouchableOpacity>
	}

	_renderSectionHeader = ({section, index, separators}) => {
		return <View style={{
			flex: 1,
			flexDirection: "row",
			paddingLeft: 10, 
			paddingRight: 10, 
			paddingTop: 5, 
			paddingBottom: 5, 
			backgroundColor: "wheat", 
			color: "black"}}>
				<Text style={{fontSize: 15, fontWeight: "bold"}}>{section.title}</Text>
		</View>
	}

	render() {
		return <View style={{flex: 1, flexDirection: "column"}}>
			<SearchBar
				round
				searchIcon={{ size: 24 }}
				onChangeText={this._onSearchChange}
				onClear={this._onSearchClear}
				placeholder="Search..."
				value={this.state.query}
			/>
			<SectionList
				sections={this._generateDataFromQuery(this.state.query)}
				keyExtractor={(item, index) => index.toString()}
				renderItem={this._renderSearchResult}
				renderSectionHeader={this._renderSectionHeader}
			/>
		</View>
	}
}

const Stack = createStackNavigator();

export default class App extends React.Component {
  constructor(props) {
	super(props)
	this.state = {
		appIsReady: false
	}
  }
  componentDidMount() {
  	id = 0;
	for (var system in Criteria) {
		for (var complaint in Criteria[system]) {
			for (var variant in Criteria[system][complaint]) {
			let index_to_add = system + _DELIMITER + complaint + _DELIMITER + variant;
				_INDEX_TO_DOCUMENT[id] = index_to_add;
				Index.add(id++, index_to_add);
			}
		} 
	}
	this.setState({
		appIsReady: true
	});
  }
  render() {
  	if (this.state.appIsReady) {
		return (
			<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen name="Home" options={{ title: "ACR Appropriateness Criteria Search" }} component={HomeScreen} />
				<Stack.Screen name="Table" options={{ title: "" }} component={TableScreen} />
			</Stack.Navigator>
			</NavigationContainer>
		);
	} else {
		return <AppLoading />
	}
  }
}
