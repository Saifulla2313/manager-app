import ArrowLeft from "@/components/Icons/ArrowLeft";
import { Stack, useLocalSearchParams } from "expo-router";
import { Pressable, Text } from "react-native";

export default function InstantLayout() {
  const params = useLocalSearchParams();
  const taskId = params.taskId as string;

  return (
    <Stack 
      screenOptions={({navigation}) => ({ 
        headerShown: true,
        headerBackTitle: "Назад",
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
        },
        headerLeft:()=> (
          <Pressable onPress={() => navigation.goBack()} style={{paddingHorizontal:12, paddingVertical:5}}>
              <ArrowLeft/>
          </Pressable>
          ),
        })}
    >
      <Stack.Screen 
        name="create-task" 
        options={{ 
          title: taskId ? "Редактировать задачу" : "Новая задача"
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