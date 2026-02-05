import React from 'react';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import AppNavigatorDev from './navigation/AppNavigatorDev';

// Toggle between development and production navigator
// Set to true for development (skip splash, go directly to ParentAdmin)
// Set to false for production (normal flow with splash screen)
const USE_DEV_MODE = false;

// Enable Fast Refresh for this component
if (__DEV__) {
  // This ensures the component is hot-reloadable
  console.log('Fast Refresh enabled for App.js');
  console.log(
    `Navigation Mode: ${USE_DEV_MODE ? 'DEVELOPMENT' : 'PRODUCTION'}`,
  );
}

function App() {
  const Navigator = USE_DEV_MODE ? AppNavigatorDev : AppNavigator;

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <Navigator />
      </SafeAreaView>
    </>
  );
}

export default App;
