import { createContext, useCallback, useEffect, useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const FormFocusContext = createContext<(field: View | null) => void>(() => {});

/** Keep the entire password field, including its visibility control, above the IME. */
export function KeyboardAwareForm({
  children,
  contentContainerStyle,
  containerStyle,
  ...props
}: ScrollViewProps & { containerStyle?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const focusedField = useRef<View | null>(null);
  const scrollY = useRef(0);
  const keyboardTop = useRef<number | null>(null);

  const revealFocusedField = useCallback(() => {
    requestAnimationFrame(() => {
      const field = focusedField.current;
      if (!field) return;
      scroll.current?.getNativeScrollRef()?.measureInWindow((_x, top, _width, height) => {
        field.measureInWindow((_fieldX, fieldTop, _fieldWidth, fieldHeight) => {
          if (focusedField.current !== field) return;
          const visibleTop = top + 12;
          // The resized viewport also works when Android omits keyboard events.
          const visibleBottom = Math.min(top + height, keyboardTop.current ?? top + height) - 12;
          if (visibleBottom <= visibleTop) return;
          // If large text makes the field taller than the viewport, start at its
          // top; the user can still scroll to the visibility control and submit.
          const delta = fieldHeight > visibleBottom - visibleTop || fieldTop < visibleTop
            ? fieldTop - visibleTop
            : Math.max(0, fieldTop + fieldHeight - visibleBottom);
          if (delta !== 0) scroll.current?.scrollTo({ y: Math.max(0, scrollY.current + delta), animated: true });
        });
      });
    });
  }, []);

  const focusField = useCallback((field: View | null) => {
    focusedField.current = field;
    revealFocusedField();
  }, [revealFocusedField]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (event) => {
      keyboardTop.current = event.endCoordinates.screenY;
      revealFocusedField();
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => { keyboardTop.current = null; });
    return () => { focusedField.current = null; show.remove(); hide.remove(); };
  }, [revealFocusedField]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top}
      style={[styles.flex, containerStyle]}
    >
      <ScrollView
        {...props}
        ref={scroll}
        style={[styles.flex, props.style]}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={(event) => {
          scrollY.current = event.nativeEvent.contentOffset.y;
          props.onScroll?.(event);
        }}
        onLayout={(event) => { revealFocusedField(); props.onLayout?.(event); }}
      >
        <FormFocusContext.Provider value={focusField}>{children}</FormFocusContext.Provider>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1 },
});
