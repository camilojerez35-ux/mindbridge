const React = require('react');

const View = ({ children, style, ...props }) => React.createElement('View', props, children);
const Text = ({ children, ...props }) => React.createElement('Text', props, children);
const TouchableOpacity = ({ children, onPress, disabled, ...props }) =>
  React.createElement('TouchableOpacity', { onClick: disabled ? undefined : onPress, ...props }, children);
const ActivityIndicator = (props) => React.createElement('ActivityIndicator', props);
const StyleSheet = { create: (styles) => styles, flatten: (s) => s };
const Linking = { openURL: jest.fn().mockResolvedValue(undefined) };
const Alert = { alert: jest.fn() };
const Animated = {
  View,
  Value: class { constructor(v) { this._value = v; } },
  timing: jest.fn(() => ({ start: jest.fn() })),
  spring: jest.fn(() => ({ start: jest.fn() })),
};
const Platform = { OS: 'ios', select: (obj) => obj.ios || obj.default };
const Keyboard = { dismiss: jest.fn() };
const ScrollView = ({ children, ...props }) => React.createElement('ScrollView', props, children);
const FlatList = ({ data, renderItem, keyExtractor, ...props }) =>
  React.createElement('FlatList', props, data?.map((item, i) => renderItem({ item, index: i })));
const TextInput = (props) => React.createElement('TextInput', props);
const Image = (props) => React.createElement('Image', props);
const Modal = ({ children, visible, ...props }) =>
  visible ? React.createElement('Modal', props, children) : null;
const SafeAreaView = ({ children, ...props }) => React.createElement('SafeAreaView', props, children);
const RefreshControl = (props) => React.createElement('RefreshControl', props);
const KeyboardAvoidingView = ({ children, ...props }) => React.createElement('KeyboardAvoidingView', props, children);

module.exports = {
  View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, Alert,
  Animated, Platform, Keyboard, ScrollView, FlatList, TextInput, Image, Modal,
  SafeAreaView, RefreshControl, KeyboardAvoidingView,
  useColorScheme: jest.fn(() => 'light'),
  useWindowDimensions: jest.fn(() => ({ width: 390, height: 844 })),
};
