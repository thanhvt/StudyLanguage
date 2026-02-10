import '@/config/global.css';
import '@/config/i18n';
import React from 'react';
import {StatusBar, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useAppStore} from '@/store/useAppStore';
import RootStackNavigator from '@/navigation/RootStackNavigator';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {useColors} from '@/hooks/useColors';
import InsetsHelper from '@/components/helpers/InsetsHelper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {LanguageHelper} from '@/components/helpers/LanguageHelper';
import {DialogProvider} from '@/components/ui/DialogProvider';
import {ToastProvider} from '@/components/ui/ToastProvider';

// Cấu hình QueryClient cho TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút trước khi data coi là cũ
      retry: 2, // Retry tối đa 2 lần khi lỗi
    },
  },
});

const AppContent: React.FC = () => {
  const theme = useAppStore(state => state.theme);
  const colors = useColors();

  return (
    <GestureHandlerRootView>
      <View style={{flex: 1}} className={theme === 'dark' ? 'dark' : ''}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <NavigationContainer
          theme={{
            ...DefaultTheme,
            dark: theme === 'dark',
            colors: {
              primary: colors.primary,
              background: colors.background,
              card: colors.neutrals800,
              text: colors.foreground,
              border: colors.neutrals700,
              notification: colors.primary,
            },
          }}>
          <BottomSheetModalProvider>
            <SafeAreaProvider>
              <DialogProvider>
                <ToastProvider>
                  <InsetsHelper />
                  <LanguageHelper />
                  <RootStackNavigator />
                </ToastProvider>
              </DialogProvider>
            </SafeAreaProvider>
          </BottomSheetModalProvider>
        </NavigationContainer>
      </View>
    </GestureHandlerRootView>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
