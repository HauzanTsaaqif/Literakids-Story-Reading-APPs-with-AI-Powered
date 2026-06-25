import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, Image } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

// Import Child Screens
import HomeScreen from '../screens/HomeScreen';
import StoryReaderScreen from '../screens/StoryReaderScreen';

// Import Parent Screens
import LoginScreen from '../screens/parent/LoginScreen';
import RegisterScreen from '../screens/parent/RegisterScreen';
import DashboardScreen from '../screens/parent/DashboardScreen';
import BookListScreen from '../screens/parent/BookListScreen';
import SettingsScreen from '../screens/parent/SettingsScreen';
import GlobalBookListScreen from '../screens/parent/GlobalBookListScreen';
import GenerateStoryScreen from '../screens/parent/GenerateStoryScreen';
import StorySettingsScreen from '../screens/parent/StorySettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Child Tab Navigator (Ruang Baca + Orang Tua)
function ChildTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B9D',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Reading"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ruang Baca',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../assets/images/icon/book.png')}
              style={styles.iconImage}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ParentTab"
        component={LoginScreen}
        options={{
          tabBarLabel: 'Orang Tua',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../assets/images/icon/orangtua.png')}
              style={styles.iconImage}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Parent Admin Tab Navigator
function ParentAdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E91E63',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../assets/images/icon/chart.png')}
              style={styles.tabIcon}
            />
          ),
        }}
      />
      <Tab.Screen
        name="BookList"
        component={BookListScreen}
        options={{
          tabBarLabel: 'Buku',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../assets/images/icon/book.png')}
              style={styles.tabIcon}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Pengaturan',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../assets/images/icon/settings.png')}
              style={styles.tabIcon}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Development Root Stack Navigator - Langsung ke ParentAdmin
export default function AppNavigatorDev() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ParentAdmin"
        screenOptions={{
          headerShown: false,
        }}>
        {/* Development: Skip splash and main, go directly to ParentAdmin */}
        <Stack.Screen name="ParentAdmin" component={ParentAdminNavigator} />
        <Stack.Screen name="Main" component={ChildTabNavigator} />
        <Stack.Screen
          name="StoryReader"
          component={StoryReaderScreen}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="GlobalBookList"
          component={GlobalBookListScreen}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="GenerateStory"
          component={GenerateStoryScreen}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="StorySettingsScreen"
          component={StorySettingsScreen}
          options={{
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconImage: {
    width: 50,
    height: 50,
  },
  tabIcon: {
    width: 40,
    height: 40,
  },
});
