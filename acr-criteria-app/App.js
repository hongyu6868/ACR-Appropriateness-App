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

import Criteria from './data/criteria.json';

class TableScreen extends React.Component {
	constructor(props) {
		super(props)
		this.payload = props.route.params.payload;
		console.log(this.payload);
	}
	render() {
		const data = this.payload.recommendation_table;
		return <ScrollView style={{flex: 1, flexDirection: "column", paddingTop: 10, paddingLeft: 20, paddingRight: 20, paddingBottom: 10}}>
			<Text style={{fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center"}}>{this.payload.variant}</Text>
			{(() => {
				return data.map((item) => {
					let color = "#AAFFAA";
					if (item["recommendation"].indexOf("not") !== -1) {
						color = "#FFAAAA";
					}
					if (item["recommendation"].indexOf("May") !== -1) {
						color = "#FFFFAA";
					}
					return <View style={{flex: 1, paddingTop: 8, paddingBottom: 8, paddingLeft: 15, paddingRight: 15, backgroundColor: color, flexDirection: "row"}}>
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
		console.log(query);
		if (!query || query.length < 2) {
			return [];
		}
		var results = [];
		id = 0;
		for (var system_id in Criteria["systems"]) {
			const system = Criteria["systems"][system_id]["name"];
			for (var complaint_id in Criteria["systems"][system_id]["complaints"]) {
				const complaint = Criteria["systems"][system_id]["complaints"][complaint_id]["name"];
				const variants = [];
				for (var variant_id in Criteria["systems"][system_id]["complaints"][complaint_id]["variants"]) {
					const variant = Criteria["systems"][system_id]["complaints"][complaint_id]["variants"][variant_id]["name"];
					variants.push({
						variant: variant,
						recommendation_table: Criteria["systems"][system_id]["complaints"][complaint_id]["variants"][variant_id]["recommendation_table"]
					});
				}
				if (complaint.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
					results.push({
						id: id++,
						title: system + " > " + complaint,
						data: variants
					});
				}
				
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
		return <Text>{section.title}</Text>
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
