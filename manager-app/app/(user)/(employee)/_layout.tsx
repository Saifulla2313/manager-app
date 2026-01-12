import CheckSquare from "@/components/Icons/TabIcons/CheckSquare";
import DashboardIcon from "@/components/Icons/TabIcons/DashboardIcon";
import SettingsIcon from "@/components/Icons/TabIcons/SettingsIcon";
import { Tabs } from "expo-router";

export default function EmployeeTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="main" 
          options={{ 
            title: "Задачи",
            tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />
          }} 
      />
      <Tabs.Screen name="notifications" 
          options={{ 
            title: "Уведомления",
            tabBarIcon: ({ color, size }) => <DashboardIcon color={color} size={size} />
          }}  
      />
      <Tabs.Screen name="settings"  
          options={{ 
            title: "Профиль",
            tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} /> 
          }}  
      />
      
      {/* Скрываем вложенные экраны из табов */}
      <Tabs.Screen name="task-details" options={{ href: null }} />
    </Tabs>
  );
}