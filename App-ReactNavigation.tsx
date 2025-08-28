// App-ReactNavigation.tsx - Version avec React Navigation
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context';
import { NavigationContainer } from './src/navigation';
import { SmartNotifications } from './src/components/common';
import { GlobalStyles, Colors } from './src/styles';
import './src/utils/webCSS';
import './src/i18n';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SafeAreaView style={GlobalStyles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
          <NavigationContainer />
          <SmartNotifications position="bottom" maxVisible={3} />
        </SafeAreaView>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}