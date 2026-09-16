import { useContext, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { FormFocusContext } from './KeyboardAwareForm';
import { theme } from '../theme';

type PasswordFieldProps = Omit<TextInputProps,
  'secureTextEntry' | 'autoCapitalize' | 'autoCorrect' | 'autoComplete' | 'textContentType' | 'importantForAutofill'
> & { purpose: 'new' | 'current'; onDark?: boolean };

export function PasswordField({ purpose, onDark = false, onFocus, onBlur, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const field = useRef<View>(null);
  const focusField = useContext(FormFocusContext);
  const action = visible ? 'Hide' : 'Show';

  return (
    <View ref={field} collapsable={false}>
      <TextInput
        {...props}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={purpose === 'new' ? 'new-password' : 'current-password'}
        importantForAutofill="yes"
        secureTextEntry={!visible}
        onFocus={(event) => { focusField(field.current); onFocus?.(event); }}
        onBlur={(event) => { focusField(null); onBlur?.(event); }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${action} ${(props.accessibilityLabel || 'password').toLowerCase()}`}
        disabled={props.editable === false}
        onPress={() => setVisible((current) => !current)}
        style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
      >
        <Text style={[styles.toggleText, onDark && styles.onDark]}>{action} password</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { alignSelf: 'flex-end', justifyContent: 'center', minHeight: 44, paddingHorizontal: 8, marginBottom: 8 },
  toggleText: { color: theme.colors.deepIndigo, fontFamily: theme.fonts.body, fontSize: 14, textDecorationLine: 'underline' },
  onDark: { color: theme.colors.textOnDarkMuted },
  pressed: { opacity: 0.78 },
});
