import CheckSquare from "@/components/Icons/TabIcons/CheckSquare";
import DashboardIcon from "@/components/Icons/TabIcons/DashboardIcon";
import SettingsIcon from "@/components/Icons/TabIcons/SettingsIcon";
import UsersIcon from "@/components/Icons/TabIcons/UsersIcon";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ManagerTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs 
    screenOptions={{
      // headerShown: false,
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: 'bold',
      },
      tabBarActiveTintColor: "#ff6600",
      tabBarInactiveTintColor: "#9ca3af",
      tabBarStyle: {
        borderTopColor: "#e5e7eb",
        borderTopWidth: 1,
        height: 60 + insets.bottom, 
        paddingBottom: 8 + insets.bottom, 
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "500",
      },
    }}
    >
      <Tabs.Screen name="dashboard" 
        options={{ 
          title: "Главная",
          tabBarIcon: ({ color, size }) => <DashboardIcon color={color} size={size} />
        }}  
       />
      <Tabs.Screen name="tasks" 
          options={{ 
            title: "Задачи",
            tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />
          }} 
        />
      <Tabs.Screen name="team" 
          options={{ 
            title: "Команда",
            headerShown:false,
            tabBarIcon: ({ color, size }) => <UsersIcon color={color} size={size} />
          }} 
      />
      <Tabs.Screen name="settings" 
          options={{ 
            title: "Настройки",
            tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} /> 
          }} 
      />
      
      {/* Скрываем вложенные экраны из табов */}
      <Tabs.Screen name="routine" options={{ href: null, headerShown:false }} />
      <Tabs.Screen name="instant" options={{ href: null, headerShown:false }} />
      {/* <Tabs.Screen name="employee-profile" options={{ href: null, headerShown:false }} /> */}
    </Tabs>
  );
}