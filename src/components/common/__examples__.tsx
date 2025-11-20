/**
 * Component Examples
 * 
 * This file demonstrates usage of all common components.
 * Use this for reference or testing during development.
 * 
 * NOTE: This file is not imported anywhere in the app - it's for documentation purposes only.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Avatar, Card, Input } from './index';
import { colors, typography, spacing } from '@/theme';

export default function ComponentExamples() {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Button Examples */}
      <Text style={styles.sectionTitle}>Buttons</Text>
      
      <Card style={styles.exampleCard}>
        <Text style={styles.label}>Primary Button</Text>
        <Button title="Primary" onPress={() => console.log('Primary pressed')} />
        
        <Text style={[styles.label, styles.spacer]}>Secondary Button</Text>
        <Button 
          title="Secondary" 
          onPress={() => console.log('Secondary pressed')} 
          variant="secondary" 
        />
        
        <Text style={[styles.label, styles.spacer]}>Outline Button</Text>
        <Button 
          title="Outline" 
          onPress={() => console.log('Outline pressed')} 
          variant="outline" 
        />
        
        <Text style={[styles.label, styles.spacer]}>Ghost Button</Text>
        <Button 
          title="Ghost" 
          onPress={() => console.log('Ghost pressed')} 
          variant="ghost" 
        />
        
        <Text style={[styles.label, styles.spacer]}>Loading Button</Text>
        <Button 
          title="Loading" 
          onPress={() => {}} 
          isLoading={true} 
        />
        
        <Text style={[styles.label, styles.spacer]}>Disabled Button</Text>
        <Button 
          title="Disabled" 
          onPress={() => {}} 
          disabled={true} 
        />
        
        <Text style={[styles.label, styles.spacer]}>Button Sizes</Text>
        <View style={styles.row}>
          <Button title="Small" onPress={() => {}} size="sm" style={styles.buttonSpacing} />
          <Button title="Medium" onPress={() => {}} size="md" style={styles.buttonSpacing} />
          <Button title="Large" onPress={() => {}} size="lg" />
        </View>
      </Card>

      {/* Avatar Examples */}
      <Text style={styles.sectionTitle}>Avatars</Text>
      
      <Card style={styles.exampleCard}>
        <Text style={styles.label}>Avatar with Image</Text>
        <Avatar 
          name="John Doe" 
          uri="https://i.pravatar.cc/150?img=12"
          size={60}
        />
        
        <Text style={[styles.label, styles.spacer]}>Avatar with Initials</Text>
        <Avatar 
          name="Jane Smith" 
          size={60}
        />
        
        <Text style={[styles.label, styles.spacer]}>Avatar with Online Status</Text>
        <View style={styles.row}>
          <Avatar 
            name="Mike Johnson" 
            uri="https://i.pravatar.cc/150?img=33"
            showOnlineStatus
            isOnline={true}
            size={50}
            style={styles.avatarSpacing}
          />
          <Avatar 
            name="Sarah Williams" 
            uri="https://i.pravatar.cc/150?img=45"
            showOnlineStatus
            isOnline={false}
            size={50}
          />
        </View>
        
        <Text style={[styles.label, styles.spacer]}>Avatar Sizes</Text>
        <View style={styles.row}>
          <Avatar name="Small" size={30} style={styles.avatarSpacing} />
          <Avatar name="Medium" size={50} style={styles.avatarSpacing} />
          <Avatar name="Large" size={80} />
        </View>
      </Card>

      {/* Card Examples */}
      <Text style={styles.sectionTitle}>Cards</Text>
      
      <Card style={styles.exampleCard}>
        <Text style={styles.label}>Default Card (with elevation)</Text>
      </Card>
      
      <Card elevated={false} style={styles.exampleCard}>
        <Text style={styles.label}>Flat Card (no elevation)</Text>
      </Card>
      
      <Card padding="xs" style={styles.exampleCard}>
        <Text style={styles.label}>Extra Small Padding</Text>
      </Card>
      
      <Card padding="lg" style={styles.exampleCard}>
        <Text style={styles.label}>Large Padding</Text>
      </Card>

      {/* Input Examples */}
      <Text style={styles.sectionTitle}>Inputs</Text>
      
      <Card style={styles.exampleCard}>
        <Input
          label="Basic Input"
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Enter text..."
        />
        
        <Input
          label="Input with Error"
          value=""
          onChangeText={() => {}}
          placeholder="Invalid input"
          error="This field is required"
        />
        
        <Input
          label="Input with Helper Text"
          value=""
          onChangeText={() => {}}
          placeholder="username"
          helperText="3-15 characters, lowercase only"
        />
        
        <Input
          label="Handle"
          value="johnrider"
          onChangeText={() => {}}
          placeholder="username"
          leftElement={<Text style={{ color: colors.primary, fontSize: 18 }}>@</Text>}
          rightElement={<Text style={{ color: colors.success, fontSize: 20 }}>✓</Text>}
        />
        
        <Input
          label="Search"
          value=""
          onChangeText={() => {}}
          placeholder="Search..."
          rightElement={<ActivityIndicator size="small" color={colors.primary} />}
        />
      </Card>

      {/* Combined Example */}
      <Text style={styles.sectionTitle}>Combined Example</Text>
      
      <Card style={styles.exampleCard}>
        <View style={styles.profileHeader}>
          <Avatar 
            name="Alex Rodriguez" 
            uri="https://i.pravatar.cc/150?img=68"
            size={60}
            showOnlineStatus
            isOnline={true}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Alex Rodriguez</Text>
            <Text style={styles.profileHandle}>@alexrider</Text>
          </View>
        </View>
        
        <Text style={styles.profileBio}>
          Passionate motorcyclist 🏍️ | Weekend warrior | Always up for a ride
        </Text>
        
        <View style={styles.buttonRow}>
          <Button 
            title="Follow" 
            onPress={() => console.log('Follow')} 
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button 
            title="Message" 
            onPress={() => console.log('Message')} 
            variant="outline"
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </Card>
      
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  exampleCard: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  spacer: {
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonSpacing: {
    marginRight: spacing.sm,
  },
  avatarSpacing: {
    marginRight: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  profileHandle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  profileBio: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  buttonRow: {
    flexDirection: 'row',
  },
});

