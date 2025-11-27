# react-native-transformable-view

A powerful and smooth **React Native Transformable View** component that enables intuitive drag, rotate, and scale interactions on any view. Built with `react-native-reanimated` and `react-native-gesture-handler`, it provides native-like performance for complex gestures.

<div align="center">
  <img src="assets/transformable_view_demo.gif" style="max-width: 40%;" alt="Demo" />
</div>
<video src="https://private-user-images.githubusercontent.com/51397024/519555765-8e315cd5-b7c5-4dfc-9687-6f8b6b47110a.mov?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjQyMjc3MjcsIm5iZiI6MTc2NDIyNzQyNywicGF0aCI6Ii81MTM5NzAyNC81MTk1NTU3NjUtOGUzMTVjZDUtYjdjNS00ZGZjLTk2ODctNmY4YjZiNDcxMTBhLm1vdj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTExMjclMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUxMTI3VDA3MTAyN1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTUzNTdiNThiYmY2NzdjY2VlZjFhOGRhYzhhZTY5MTRlYzRjZGI3Y2I3OTg3MDE0M2YyNTlhMGQ2Yzk5ODZmYTcmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.D1IxIneHcQI2hxCmNlBORaNdK_R6dXpXmogM2f5HzNE" data-canonical-src="https://private-user-images.githubusercontent.com/51397024/519555765-8e315cd5-b7c5-4dfc-9687-6f8b6b47110a.mov?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjQyMjc3MjcsIm5iZiI6MTc2NDIyNzQyNywicGF0aCI6Ii81MTM5NzAyNC81MTk1NTU3NjUtOGUzMTVjZDUtYjdjNS00ZGZjLTk2ODctNmY4YjZiNDcxMTBhLm1vdj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTExMjclMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUxMTI3VDA3MTAyN1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTUzNTdiNThiYmY2NzdjY2VlZjFhOGRhYzhhZTY5MTRlYzRjZGI3Y2I3OTg3MDE0M2YyNTlhMGQ2Yzk5ODZmYTcmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.D1IxIneHcQI2hxCmNlBORaNdK_R6dXpXmogM2f5HzNE" controls="controls" muted="muted" class="d-block rounded-bottom-2 border-top width-fit" style="max-height:640px; min-height: 200px">

  </video>

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
