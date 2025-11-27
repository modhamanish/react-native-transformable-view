# react-native-transformable-view

A powerful and smooth **React Native Transformable View** component that enables intuitive drag, rotate, and scale interactions on any view. Built with `react-native-reanimated` and `react-native-gesture-handler`, it provides native-like performance for complex gestures.

<div align="center">
  <img src="assets/transformable_view_demo.gif" style="max-width: 50%;" alt="Demo" />
</div>
<div align="center">
  <video controls src="assets/transformable_view_demo.mov" style="max-width: 50%;" alt="Demo" />
</div>

## Features

- 👆 **Drag & Drop**: Smooth dragging interaction.
- 🔄 **Rotate**: Intuitive two-finger rotation or handle-based rotation.
- 📐 **Resize**: Pinch-to-zoom or handle-based resizing with aspect ratio preservation.
- 🗑️ **Delete & Copy**: Built-in support for delete and duplicate actions.
- 🎨 **Customizable**: Fully customizable content and styling.
- 📱 **Cross-Platform**: Works seamlessly on both iOS and Android.

## Installation

First, install the package:

```bash
npm install @modhamanish/react-native-transformable-view
# or
yarn add @modhamanish/react-native-transformable-view
```

### Peer Dependencies

This library relies on `react-native-reanimated` and `react-native-gesture-handler`. Make sure to install them if you haven't already:

```bash
npm install react-native-reanimated react-native-gesture-handler
# or
yarn add react-native-reanimated react-native-gesture-handler
```

> **Note**: Don't forget to add `react-native-reanimated/plugin` to your `babel.config.js`.

## Usage

Wrap your content with `TransformableView` to make it interactive.

```tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import TransformableView from '@modhamanish/react-native-transformable-view';

const App = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleDeselect = () => {
    setSelectedId(null);
  };

  const handleDelete = (id: string) => {
    console.log('Delete item:', id);
  };

  const handleCopy = (id: string) => {
    console.log('Copy item:', id);
  };

  return (
    <View style={styles.container}>
      <TransformableView
        id="item-1"
        isSelected={selectedId === 'item-1'}
        onSelect={handleSelect}
        onDeselect={handleDeselect}
        onDelete={handleDelete}
        onCopy={handleCopy}
        initialX={100}
        initialY={100}
        initialWidth={150}
        initialHeight={150}
      >
        <View style={styles.box}>
          {/* Your Content Here */}
        </View>
      </TransformableView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  box: {
    flex: 1,
    backgroundColor: 'tomato',
    borderRadius: 8,
  },
});

export default App;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | **Required** | Unique identifier for the draggable item. |
| `isSelected` | `boolean` | **Required** | Whether the item is currently selected (shows controls). |
| `onSelect` | `(id: string) => void` | **Required** | Callback when the item is tapped/selected. |
| `onDeselect` | `() => void` | **Required** | Callback when the item is deselected (e.g., tapping outside). |
| `initialX` | `number` | `50` | Initial X position. |
| `initialY` | `number` | `50` | Initial Y position. |
| `initialWidth` | `number` | `100` | Initial width. |
| `initialHeight` | `number` | `100` | Initial height. |
| `containerWidth` | `number` | `300` | Width of the boundary container. |
| `containerHeight` | `number` | `300` | Height of the boundary container. |
| `onDelete` | `(id: string) => void` | `undefined` | Callback when the delete button is pressed. |
| `onCopy` | `(id: string) => void` | `undefined` | Callback when the copy button is pressed. |
| `children` | `React.ReactNode` | `undefined` | The content to be rendered inside the transformable view. |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
