import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { colors } from '../constants';
import CustomCheckbox from './CustomCheckbox';

interface ReminderItemProps {
  icon: React.ComponentProps<typeof MaterialDesignIcons>['name'];
  label: string;
  time: string;
  description?: string;
  goal?: string;
  checked: boolean;
  onValueChange: (value: boolean) => void;
}

const CheckboxCard: React.FC<ReminderItemProps> = ({
  icon,
  label,
  time,
  description,
  goal,
  checked,
  onValueChange,
}) => (
  <View style={styles.row}>
    <View style={[styles.icon, checked && styles.completedIcon]}>
      <MaterialDesignIcons
        name={icon}
        color={checked ? colors.grey_text : colors.light_green}
        size={23}
      />
    </View>
    <View style={styles.content}>
      <Text
        style={[styles.label, checked && styles.completedLabel]}
        numberOfLines={2}
      >
        {label}
      </Text>
      {description ? (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      ) : null}
      <View style={styles.metadata}>
        <MaterialDesignIcons
          name={checked ? 'check-circle-outline' : 'repeat'}
          size={12}
          color={checked ? colors.light_green : colors.grey_text}
        />
        <Text style={[styles.time, checked && styles.completedTime]}>
          {checked ? 'Completed' : time}
        </Text>
      </View>
      {goal ? (
        <Text style={styles.goal} numberOfLines={2}>
          {goal}
        </Text>
      ) : null}
    </View>
    <CustomCheckbox
      checked={checked}
      onValueChange={onValueChange}
      accessibilityLabel={`Mark ${label} as ${checked ? 'incomplete' : 'complete'}`}
    />
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.icon_bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIcon: { backgroundColor: colors.dark_bg },
  content: { flex: 1, minWidth: 0 },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  completedLabel: { color: colors.grey_text },
  description: {
    color: colors.grey_text,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
  },
  time: { color: colors.grey_text, fontSize: 12 },
  completedTime: { color: colors.light_green },
  goal: {
    color: colors.light_green,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
});

export default CheckboxCard;
