import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const TestLoginScreen: React.FC = () => {
  console.log('TestLoginScreen rendering!');
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>TEST LOGIN SCREEN</Text>
      <Text style={styles.text}>This should be visible!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default TestLoginScreen;