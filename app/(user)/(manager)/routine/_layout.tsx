import ArrowLeft from "@/components/Icons/ArrowLeft";
import { Stack, useLocalSearchParams } from "expo-router";
import { Pressable, Text } from "react-native";

export default function RoutineLayout() {
  const params = useLocalSearchParams();
  const templateId = params.templateId as string;

  return (
    <Stack 
      screenOptions={({navigation}) => ({ 
        headerShown: true,
        headerBackTitle: "Назад",
        headerLeft:()=> (
          <Pressable onPress={() => navigation.goBack()} style={{paddingHorizontal:12, paddingVertical:5}}>
              <ArrowLeft/>
          </Pressable>
      ),
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
        }
      })}
    >
      <Stack.Screen 
        name="create-template" 
        options={{ 
          title: templateId ? "Редактировать шаблон" : "Новый шаблон"
        }} 
      />
      <Stack.Screen 
        name="task-details" 
        options={{ 
          title: "Детали задачи"
        }} 
      />
    </Stack>
  );
}