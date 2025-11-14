import ArrowLeft from "@/components/Icons/ArrowLeft";
import { Stack, useLocalSearchParams } from "expo-router";
import { Pressable, Text } from "react-native";

export default function TeamLayout() {
    const params = useLocalSearchParams();
  const employeeId = params.employeeId as string;

  // Данные сотрудника (в реальном приложении нужно получать из API/контекста)
  const getEmployeeName = (id: string) => {
    const employees = {
      '1': 'Sarah Johnson',
      '2': 'Mike Chen', 
      '3': 'Emma Davis',
      '4': 'James Wilson',
      '5': 'Lisa Anderson',
    };
    return employees[id as keyof typeof employees] || 'Сотрудник';
  };
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Сотрудники",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
          },
        //   headerShown: false // Скрываем header для основного экрана, т.к. он в табах
        }} 
      />
      <Stack.Screen 
        name="employee-profile" 
        options={({navigation}) => ({ 
            title: getEmployeeName(employeeId),
            headerShown: true,
            headerBackTitle: "Назад",
            headerLeft:()=> (
              <Pressable onPress={() => navigation.goBack()} style={{paddingHorizontal:12, paddingVertical:5}}>
                  <ArrowLeft/>
              </Pressable>
              ),
            })}
      />
    </Stack>
  );
}