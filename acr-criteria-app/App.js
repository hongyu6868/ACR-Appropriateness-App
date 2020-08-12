import * as React from 'react';
import { 
	Button,
	FlatList,
	ScrollView,
	Text,
	TouchableOpacity,
	View, 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SearchBar } from 'react-native-elements';

import Criteria from './data/criteria.json';

class TableScreen extends React.Component {
	constructor(props) {
		super(props)
		this.criteriaKey = props.route.params.criteriaKey;
	}
	render() {
		const data = Criteria[this.criteriaKey];
		return <ScrollView style={{flex: 1, flexDirection: "column", paddingTop: 10, paddingLeft: 20, paddingRight: 20, paddingBottom: 10}}>
			<Text style={{fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center"}}>{this.criteriaKey}</Text>
			{(() => {
				return data.map((item) => {
					let color = "#AAFFAA";
					if (item[1].indexOf("not") !== -1) {
						color = "#FFAAAA";
					}
					if (item[1].indexOf("May") !== -1) {
						color = "#FFFFAA";
					}
					return <View style={{flex: 1, paddingTop: 8, paddingBottom: 8, paddingLeft: 15, paddingRight: 15, backgroundColor: color, flexDirection: "row"}}>
						<View style={{flex: 0.5}}><Text>{item[0]}</Text></View>
						<View style={{flex: 0.5}}><Text>{item[1]}</Text></View>
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
		console.log(query);
		if (!query || query.length < 2) {
			return [];
		}
		var results = [];
		id = 0;
		for (var key in Criteria) {
			if (key.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
				results.push({
					id: id++,
					header: key,
				});
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
	_renderSearchResult = ({item, index, separators}) => {
		return <TouchableOpacity onPress={() => {this.props.navigation.push("Table", {criteriaKey: item.header})}}>
			<View key={item.id} style={{flex: 1, flexDirection: "row", paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20}}>
				<Text>{item.header}</Text>
			</View>
		</TouchableOpacity>
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
			<FlatList
				data={this._generateDataFromQuery(this.state.query)}
				renderItem={this._renderSearchResult}
				keyExtractor={(item, index) => index.toString()}
			/>
		</View>
	}
}

const Stack = createStackNavigator();

export default function App() {
  return (
	<NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" options={{ title: "ACR Appropriateness Criteria Search" }} component={HomeScreen} />
        <Stack.Screen name="Table" options={{ title: "" }} component={TableScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
