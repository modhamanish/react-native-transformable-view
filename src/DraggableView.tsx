import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";

interface DraggableViewProps {
  id: string;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  containerWidth?: number;
  containerHeight?: number;
  children?: React.ReactNode;
  onDelete?: (id: string) => void;
  onCopy?: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDeselect: () => void;
}

const BUTTON_SIZE = 30;
const BUTTON_OFFSET = 15;

export const DraggableView: React.FC<DraggableViewProps> = ({
  id,
  initialX = 50,
  initialY = 50,
  initialWidth = 100,
  initialHeight = 100,
  containerWidth = 300,
  containerHeight = 300,
  children,
  onDelete,
  onCopy,
  isSelected,
  onSelect,
  onDeselect,
}) => {
  // Position and size
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const width = useSharedValue(initialWidth);
  const height = useSharedValue(initialHeight);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Context for gestures
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startWidth = useSharedValue(0);
  const startHeight = useSharedValue(0);
  const startRotation = useSharedValue(0);
  const startScale = useSharedValue(1);

  // Main view dragGesture gesture
  const dragGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      runOnJS(onSelect)(id);
    })
    .onUpdate((event) => {
      const newX = startX.value + event.translationX;
      const newY = startY.value + event.translationY;

      // Calculate center of the view
      const cx = newX + width.value / 2;
      const cy = newY + height.value / 2;

      // Calculate corners relative to center
      const w2 = width.value / 2;
      const h2 = height.value / 2;
      const cos = Math.cos(rotation.value);
      const sin = Math.sin(rotation.value);

      // 4 corners relative to center
      // TL: -w2, -h2
      // TR: w2, -h2
      // BR: w2, h2
      // BL: -w2, h2
      const x1 = -w2 * cos - -h2 * sin;
      const y1 = -w2 * sin + -h2 * cos;

      const x2 = w2 * cos - -h2 * sin;
      const y2 = w2 * sin + -h2 * cos;

      const x3 = w2 * cos - h2 * sin;
      const y3 = w2 * sin + h2 * cos;

      const x4 = -w2 * cos - h2 * sin;
      const y4 = -w2 * sin + h2 * cos;

      // Bounding box relative to center
      const minRelX = Math.min(x1, x2, x3, x4);
      const maxRelX = Math.max(x1, x2, x3, x4);
      const minRelY = Math.min(y1, y2, y3, y4);
      const maxRelY = Math.max(y1, y2, y3, y4);

      // Constrain center
      // cx + minRelX >= 0  =>  cx >= -minRelX
      // cx + maxRelX <= containerWidth  =>  cx <= containerWidth - maxRelX
      const constrainedCx = Math.max(
        -minRelX,
        Math.min(containerWidth - maxRelX, cx)
      );

      const constrainedCy = Math.max(
        -minRelY,
        Math.min(containerHeight - maxRelY, cy)
      );

      translateX.value = constrainedCx - width.value / 2;
      translateY.value = constrainedCy - height.value / 2;
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onSelect)(id);
    });

  const mainGesture = Gesture.Race(tapGesture, dragGesture);

  // Delete button gesture
  const deleteGesture = Gesture.Tap().onEnd(() => {
    if (onDelete) {
      runOnJS(onDelete)(id);
    }
  });

  // Copy button gesture
  const copyGesture = Gesture.Tap().onEnd(() => {
    if (onCopy) {
      runOnJS(onCopy)(id);
    }
  });

  // Helper to constrain view within boundaries
  const clampToBoundaries = (
    w: number,
    h: number,
    r: number,
    tx: number,
    ty: number
  ) => {
    "worklet";
    const cx = tx + w / 2;
    const cy = ty + h / 2;
    const w2 = w / 2;
    const h2 = h / 2;
    const cos = Math.cos(r);
    const sin = Math.sin(r);

    const x1 = -w2 * cos - -h2 * sin;
    const y1 = -w2 * sin + -h2 * cos;
    const x2 = w2 * cos - -h2 * sin;
    const y2 = w2 * sin + -h2 * cos;
    const x3 = w2 * cos - h2 * sin;
    const y3 = w2 * sin + h2 * cos;
    const x4 = -w2 * cos - h2 * sin;
    const y4 = -w2 * sin + h2 * cos;

    const minRelX = Math.min(x1, x2, x3, x4);
    const maxRelX = Math.max(x1, x2, x3, x4);
    const minRelY = Math.min(y1, y2, y3, y4);
    const maxRelY = Math.max(y1, y2, y3, y4);

    const bboxW = maxRelX - minRelX;
    const bboxH = maxRelY - minRelY;

    const constrainedCx = Math.max(
      -minRelX,
      Math.min(containerWidth - maxRelX, cx)
    );
    const constrainedCy = Math.max(
      -minRelY,
      Math.min(containerHeight - maxRelY, cy)
    );

    return {
      x: constrainedCx - w / 2,
      y: constrainedCy - h / 2,
      bboxW,
      bboxH,
    };
  };

  // Resize gesture (diagonal)
  const resizeGesture = Gesture.Pan()
    .onStart((event) => {
      startWidth.value = width.value;
      startHeight.value = height.value;
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Calculate new dimensions based on diagonal drag, accounting for rotation
      const cos = Math.cos(rotation.value);
      const sin = Math.sin(rotation.value);

      // Rotate translation vector into local coordinate space
      const dx = event.translationX * cos + event.translationY * sin;
      const dy = -event.translationX * sin + event.translationY * cos;

      // *********** Start width and height scale update same as aspect ratio ***********
      // Current aspect ratio
      const ratio = startWidth.value / startHeight.value;

      // Calculate the position of the cursor relative to the top-left corner (0,0)
      // The cursor started at (startWidth, startHeight) and moved by (dx, dy)
      const cursorX = startWidth.value + dx;
      const cursorY = startHeight.value + dy;

      // Project the cursor position onto the diagonal vector (startWidth, startHeight)
      // This ensures the new corner lies on the line defined by the aspect ratio
      // Projection formula: P_proj = (P . D) / (D . D) * D
      // where P is cursor vector and D is diagonal vector
      const dotProduct =
        cursorX * startWidth.value + cursorY * startHeight.value;
      const diagonalLengthSq =
        startWidth.value * startWidth.value +
        startHeight.value * startHeight.value;

      // Scale factor relative to original size
      const scaleFactor = dotProduct / diagonalLengthSq;

      // Calculate new dimensions
      // Ensure we don't shrink below a minimum size (e.g., 30px)
      // We check the smaller dimension to be safe
      let newScale = scaleFactor;
      if (
        startWidth.value * newScale < 30 ||
        startHeight.value * newScale < 30
      ) {
        // If too small, clamp to minimum based on the smaller dimension
        const minScaleW = 30 / startWidth.value;
        const minScaleH = 30 / startHeight.value;
        newScale = Math.max(minScaleW, minScaleH);
      }

      const newWidth = startWidth.value * newScale;
      const newHeight = startHeight.value * newScale;
      // *********** End width and height scale update same as aspect ratio ***********

      // *********** Start width and height update ***********
      // If you want to keep update the width and height
      // const newWidth = Math.max(30, startWidth.value + dx);
      // const newHeight = Math.max(30, startHeight.value + dy);
      // *********** End width and height update ***********

      // Calculate delta width/height
      const dw = newWidth - startWidth.value;
      const dh = newHeight - startHeight.value;

      // Calculate shift required to keep Top-Left corner fixed
      // When size changes, center shifts. We must adjust position to compensate.
      const shiftX = dw / 2 - (dw / 2) * cos + (dh / 2) * sin;
      const shiftY = dh / 2 - (dw / 2) * sin - (dh / 2) * cos;

      const targetX = startX.value - shiftX;
      const targetY = startY.value - shiftY;

      const constrained = clampToBoundaries(
        newWidth,
        newHeight,
        rotation.value,
        targetX,
        targetY
      );

      // Check if size fits in container
      if (
        constrained.bboxW > containerWidth ||
        constrained.bboxH > containerHeight
      ) {
        return;
      }

      // Check if position was shifted (hit a wall)
      if (
        Math.abs(constrained.x - targetX) > 1 ||
        Math.abs(constrained.y - targetY) > 1
      ) {
        return;
      }

      width.value = newWidth;
      height.value = newHeight;
      translateX.value = constrained.x;
      translateY.value = constrained.y;
    });

  // Height resize gesture (Bottom Center)
  const resizeHeightGesture = Gesture.Pan()
    .onStart(() => {
      startWidth.value = width.value;
      startHeight.value = height.value;
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      const cos = Math.cos(rotation.value);
      const sin = Math.sin(rotation.value);

      // Rotate translation vector
      // We only care about dy (local Y change)
      const dy = -event.translationX * sin + event.translationY * cos;

      const newHeight = Math.max(30, startHeight.value + dy);
      const dw = 0; // Width doesn't change
      const dh = newHeight - startHeight.value;

      const shiftX = dw / 2 - (dw / 2) * cos + (dh / 2) * sin;
      const shiftY = dh / 2 - (dw / 2) * sin - (dh / 2) * cos;

      const targetX = startX.value - shiftX;
      const targetY = startY.value - shiftY;

      const constrained = clampToBoundaries(
        width.value,
        newHeight,
        rotation.value,
        targetX,
        targetY
      );

      // Check if size fits in container
      if (
        constrained.bboxW > containerWidth ||
        constrained.bboxH > containerHeight
      ) {
        return;
      }

      // Check if position was shifted (hit a wall)
      if (
        Math.abs(constrained.x - targetX) > 1 ||
        Math.abs(constrained.y - targetY) > 1
      ) {
        return;
      }

      height.value = newHeight;
      translateX.value = constrained.x;
      translateY.value = constrained.y;
    });

  // Width resize gesture (Right Center)
  const resizeWidthGesture = Gesture.Pan()
    .onStart(() => {
      startWidth.value = width.value;
      startHeight.value = height.value;
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      const cos = Math.cos(rotation.value);
      const sin = Math.sin(rotation.value);

      // Rotate translation vector
      // We only care about dx (local X change)
      const dx = event.translationX * cos + event.translationY * sin;

      const newWidth = Math.max(30, startWidth.value + dx);
      const dw = newWidth - startWidth.value;
      const dh = 0; // Height doesn't change

      const shiftX = dw / 2 - (dw / 2) * cos + (dh / 2) * sin;
      const shiftY = dh / 2 - (dw / 2) * sin - (dh / 2) * cos;

      const targetX = startX.value - shiftX;
      const targetY = startY.value - shiftY;

      const constrained = clampToBoundaries(
        newWidth,
        height.value,
        rotation.value,
        targetX,
        targetY
      );

      // Check if size fits in container
      if (
        constrained.bboxW > containerWidth ||
        constrained.bboxH > containerHeight
      ) {
        return;
      }

      // Check if position was shifted (hit a wall)
      if (
        Math.abs(constrained.x - targetX) > 1 ||
        Math.abs(constrained.y - targetY) > 1
      ) {
        return;
      }

      width.value = newWidth;
      translateX.value = constrained.x;
      translateY.value = constrained.y;
    });

  // Rotate gesture - robust vector-based tracking
  const startVectorX = useSharedValue(0);
  const startVectorY = useSharedValue(0);

  const rotateGesture = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      "worklet";
      // Calculate vector from Center to Button (Bottom-Left) in Local Coords
      // Container size is (w + 2*offset, h + 2*offset)
      // Button is at Bottom-Left of container: (-Wc/2, Hc/2) relative to center
      const wc = width.value + BUTTON_OFFSET * 2;
      const hc = height.value + BUTTON_OFFSET * 2;
      const localVx = -wc / 2;
      const localVy = hc / 2;

      // Rotate vector to Screen Coords based on current rotation
      const rot = rotation.value;
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);

      // x' = x cos - y sin
      // y' = x sin + y cos
      const screenVx = localVx * cos - localVy * sin;
      const screenVy = localVx * sin + localVy * cos;

      startVectorX.value = screenVx;
      startVectorY.value = screenVy;
      startRotation.value = rot;
    })
    .onUpdate((event) => {
      "worklet";
      // Current vector = Start Vector + Translation
      const currentVx = startVectorX.value + event.translationX;
      const currentVy = startVectorY.value + event.translationY;

      // Calculate angles
      const targetAngle = Math.atan2(currentVy, currentVx);
      const startAngle = Math.atan2(startVectorY.value, startVectorX.value);

      // Calculate difference
      let angleDiff = targetAngle - startAngle;

      // Normalize
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      // Update rotation
      rotation.value = startRotation.value + angleDiff;
    });

  // Animated styles
  const animatedViewStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}rad` }, // Use radians not degrees
      ] as any,
      width: width.value,
      height: height.value,
    };
  });

  const animatedButtonContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value - BUTTON_OFFSET },
        { translateY: translateY.value - BUTTON_OFFSET },
        { rotate: `${rotation.value}rad` }, // Use radians not degrees
      ] as any,
      width: width.value + BUTTON_OFFSET * 2,
      height: height.value + BUTTON_OFFSET * 2,
    };
  });

  const counterRotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${-rotation.value}rad` }],
    };
  });

  return (
    <>
      <GestureDetector gesture={mainGesture}>
        <Animated.View
          style={[
            styles.draggableView,
            animatedViewStyle,
            isSelected && styles.selected,
          ]}
        >
          {children || <View style={styles.defaultContent} />}
        </Animated.View>
      </GestureDetector>

      {isSelected && (
        <>
          <GestureDetector
            gesture={Gesture.Tap().onEnd(() => {
              runOnJS(onDeselect)();
            })}
          >
            <Animated.View style={[StyleSheet.absoluteFill, { zIndex: -1 }]} />
          </GestureDetector>
          <Animated.View
            style={[styles.buttonContainer, animatedButtonContainerStyle]}
            pointerEvents="box-none"
          >
            {/* Delete button - Top Left (Counter-rotated) */}
            <GestureDetector gesture={deleteGesture}>
              <Animated.View
                style={[
                  styles.actionButton,
                  styles.topLeft,
                  counterRotationStyle,
                ]}
              >
                <Text style={styles.emoji}>❌</Text>
              </Animated.View>
            </GestureDetector>

            {/* Copy button - Top Right (Counter-rotated) */}
            <GestureDetector gesture={copyGesture}>
              <Animated.View
                style={[
                  styles.actionButton,
                  styles.topRight,
                  counterRotationStyle,
                ]}
              >
                <Text style={styles.emoji}>📋</Text>
              </Animated.View>
            </GestureDetector>

            {/* Resize Height Button - Bottom Center (Rotates with view) */}
            <GestureDetector gesture={resizeHeightGesture}>
              <Animated.View style={[styles.actionButton, styles.bottomCenter]}>
                <Text style={styles.emoji}>↕️</Text>
              </Animated.View>
            </GestureDetector>

            {/* Resize Width Button - Right Center (Rotates with view) */}
            <GestureDetector gesture={resizeWidthGesture}>
              <Animated.View style={[styles.actionButton, styles.rightCenter]}>
                <Text style={styles.emoji}>↔️</Text>
              </Animated.View>
            </GestureDetector>

            {/* Resize button - Bottom Right (Rotates with view) */}
            <GestureDetector gesture={resizeGesture}>
              <Animated.View style={[styles.actionButton, styles.bottomRight]}>
                <Text style={styles.emoji}>↘️</Text>
              </Animated.View>
            </GestureDetector>

            {/* Rotate button - Bottom Left (Counter-rotated) */}
            <GestureDetector gesture={rotateGesture}>
              <Animated.View
                style={[
                  styles.actionButton,
                  styles.bottomLeft,
                  counterRotationStyle,
                ]}
              >
                <Text style={styles.emoji}>🔄</Text>
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  draggableView: {
    position: "absolute",
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    borderWidth: 2,
    borderColor: "#FFD700",
    borderStyle: "dashed",
  },
  defaultContent: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
  buttonContainer: {
    position: "absolute",
    pointerEvents: "box-none",
  },
  actionButton: {
    position: "absolute",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
  bottomCenter: {
    bottom: 0,
    left: "50%",
    marginLeft: -BUTTON_SIZE / 2,
  },
  rightCenter: {
    right: 0,
    top: "50%",
    marginTop: -BUTTON_SIZE / 2,
  },
  emoji: {
    fontSize: 14,
  },
});
