"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraggableView = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_gesture_handler_1 = require("react-native-gesture-handler");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const BUTTON_SIZE = 30;
const BUTTON_OFFSET = 15;
const DraggableView = ({ id, initialX = 50, initialY = 50, initialWidth = 100, initialHeight = 100, containerWidth = 300, containerHeight = 300, children, onDelete, onCopy, isSelected, onSelect, onDeselect, }) => {
    // Position and size
    const translateX = (0, react_native_reanimated_1.useSharedValue)(initialX);
    const translateY = (0, react_native_reanimated_1.useSharedValue)(initialY);
    const width = (0, react_native_reanimated_1.useSharedValue)(initialWidth);
    const height = (0, react_native_reanimated_1.useSharedValue)(initialHeight);
    const scale = (0, react_native_reanimated_1.useSharedValue)(1);
    const rotation = (0, react_native_reanimated_1.useSharedValue)(0);
    // Context for gestures
    const startX = (0, react_native_reanimated_1.useSharedValue)(0);
    const startY = (0, react_native_reanimated_1.useSharedValue)(0);
    const startWidth = (0, react_native_reanimated_1.useSharedValue)(0);
    const startHeight = (0, react_native_reanimated_1.useSharedValue)(0);
    const startRotation = (0, react_native_reanimated_1.useSharedValue)(0);
    const startScale = (0, react_native_reanimated_1.useSharedValue)(1);
    // Main view drag gesture
    const dragGesture = react_native_gesture_handler_1.Gesture.Pan()
        .onStart(() => {
        startX.value = translateX.value;
        startY.value = translateY.value;
        (0, react_native_reanimated_1.runOnJS)(onSelect)(id);
    })
        .onUpdate(event => {
        const newX = startX.value + event.translationX;
        const newY = startY.value + event.translationY;
        // Constrain within container
        translateX.value = Math.max(0, Math.min(containerWidth - width.value, newX));
        translateY.value = Math.max(0, Math.min(containerHeight - height.value, newY));
    });
    const tapGesture = react_native_gesture_handler_1.Gesture.Tap()
        .maxDuration(250)
        .onEnd(() => {
        (0, react_native_reanimated_1.runOnJS)(onSelect)(id);
    });
    const mainGesture = react_native_gesture_handler_1.Gesture.Race(tapGesture, dragGesture);
    // Delete button gesture
    const deleteGesture = react_native_gesture_handler_1.Gesture.Tap().onEnd(() => {
        if (onDelete) {
            (0, react_native_reanimated_1.runOnJS)(onDelete)(id);
        }
    });
    // Copy button gesture
    const copyGesture = react_native_gesture_handler_1.Gesture.Tap().onEnd(() => {
        if (onCopy) {
            (0, react_native_reanimated_1.runOnJS)(onCopy)(id);
        }
    });
    // Resize gesture (diagonal)
    const resizeGesture = react_native_gesture_handler_1.Gesture.Pan()
        .onStart(event => {
        startWidth.value = width.value;
        startHeight.value = height.value;
        startX.value = translateX.value;
        startY.value = translateY.value;
    })
        .onUpdate(event => {
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
        const dotProduct = cursorX * startWidth.value + cursorY * startHeight.value;
        const diagonalLengthSq = startWidth.value * startWidth.value +
            startHeight.value * startHeight.value;
        // Scale factor relative to original size
        const scaleFactor = dotProduct / diagonalLengthSq;
        // Calculate new dimensions
        // Ensure we don't shrink below a minimum size (e.g., 30px)
        // We check the smaller dimension to be safe
        let newScale = scaleFactor;
        if (startWidth.value * newScale < 30 ||
            startHeight.value * newScale < 30) {
            // If too small, clamp to minimum based on the smaller dimension
            const minScaleW = 30 / startWidth.value;
            const minScaleH = 30 / startHeight.value;
            newScale = Math.max(minScaleW, minScaleH);
        }
        const newWidth = startWidth.value * newScale;
        const newHeight = startHeight.value * newScale;
        // *********** End width and height scale update same as aspect ratio ***********
        // If you want to keep update the width and height
        // const newWidth = Math.max(30, startWidth.value + dx);
        // const newHeight = Math.max(30, startHeight.value + dy);
        // *********** Start width and height update ***********
        // Calculate delta width/height
        const dw = newWidth - startWidth.value;
        const dh = newHeight - startHeight.value;
        // *********** End width and height update ***********
        // Calculate shift required to keep Top-Left corner fixed
        // When size changes, center shifts. We must adjust position to compensate.
        const shiftX = dw / 2 - (dw / 2) * cos + (dh / 2) * sin;
        const shiftY = dh / 2 - (dw / 2) * sin - (dh / 2) * cos;
        width.value = newWidth;
        height.value = newHeight;
        // Adjust position to keep anchor fixed
        translateX.value = startX.value - shiftX;
        translateY.value = startY.value - shiftY;
    });
    // Height resize gesture (Bottom Center)
    const resizeHeightGesture = react_native_gesture_handler_1.Gesture.Pan()
        .onStart(() => {
        startWidth.value = width.value;
        startHeight.value = height.value;
        startX.value = translateX.value;
        startY.value = translateY.value;
    })
        .onUpdate(event => {
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
        height.value = newHeight;
        translateX.value = startX.value - shiftX;
        translateY.value = startY.value - shiftY;
    });
    // Width resize gesture (Right Center)
    const resizeWidthGesture = react_native_gesture_handler_1.Gesture.Pan()
        .onStart(() => {
        startWidth.value = width.value;
        startHeight.value = height.value;
        startX.value = translateX.value;
        startY.value = translateY.value;
    })
        .onUpdate(event => {
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
        width.value = newWidth;
        translateX.value = startX.value - shiftX;
        translateY.value = startY.value - shiftY;
    });
    // Rotate gesture - robust vector-based tracking
    const startVectorX = (0, react_native_reanimated_1.useSharedValue)(0);
    const startVectorY = (0, react_native_reanimated_1.useSharedValue)(0);
    const rotateGesture = react_native_gesture_handler_1.Gesture.Pan()
        .minDistance(0)
        .onStart(() => {
        'worklet';
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
        .onUpdate(event => {
        'worklet';
        // Current vector = Start Vector + Translation
        const currentVx = startVectorX.value + event.translationX;
        const currentVy = startVectorY.value + event.translationY;
        // Calculate angles
        const targetAngle = Math.atan2(currentVy, currentVx);
        const startAngle = Math.atan2(startVectorY.value, startVectorX.value);
        // Calculate difference
        let angleDiff = targetAngle - startAngle;
        // Normalize
        if (angleDiff > Math.PI)
            angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI)
            angleDiff += 2 * Math.PI;
        // Update rotation
        rotation.value = startRotation.value + angleDiff;
    });
    // Animated styles
    const animatedViewStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotation.value}rad` }, // Use radians not degrees
            ],
            width: width.value,
            height: height.value,
        };
    });
    const animatedButtonContainerStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        return {
            transform: [
                { translateX: translateX.value - BUTTON_OFFSET },
                { translateY: translateY.value - BUTTON_OFFSET },
                { rotate: `${rotation.value}rad` }, // Use radians not degrees
            ],
            width: width.value + BUTTON_OFFSET * 2,
            height: height.value + BUTTON_OFFSET * 2,
        };
    });
    const counterRotationStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        return {
            transform: [{ rotate: `${-rotation.value}rad` }],
        };
    });
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: mainGesture, children: (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [
                        styles.draggableView,
                        animatedViewStyle,
                        isSelected && styles.selected,
                    ], children: children || (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.defaultContent }) }) }), isSelected && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: react_native_gesture_handler_1.Gesture.Tap().onEnd(() => {
                            (0, react_native_reanimated_1.runOnJS)(onDeselect)();
                        }), children: (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [react_native_1.StyleSheet.absoluteFill, { zIndex: -1 }] }) }), (0, jsx_runtime_1.jsxs)(react_native_reanimated_1.default.View, { style: [styles.buttonContainer, animatedButtonContainerStyle], pointerEvents: "box-none", children: [(0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: deleteGesture, children: (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [
                                        styles.actionButton,
                                        styles.topLeft,
                                        counterRotationStyle,
                                    ], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emoji, children: "\u274C" }) }) }), (0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: copyGesture, children: (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [
                                        styles.actionButton,
                                        styles.topRight,
                                        counterRotationStyle,
                                    ], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emoji, children: "\uD83D\uDCCB" }) }) }), (0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: resizeHeightGesture, children: (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [styles.actionButton, styles.bottomCenter], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emoji, children: "\u2195\uFE0F" }) }) }), (0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: resizeWidthGesture, children: (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [styles.actionButton, styles.rightCenter], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emoji, children: "\u2194\uFE0F" }) }) }), (0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: resizeGesture, children: (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [styles.actionButton, styles.bottomRight], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emoji, children: "\u2198\uFE0F" }) }) }), (0, jsx_runtime_1.jsx)(react_native_gesture_handler_1.GestureDetector, { gesture: rotateGesture, children: (0, jsx_runtime_1.jsx)(react_native_reanimated_1.default.View, { style: [
                                        styles.actionButton,
                                        styles.bottomLeft,
                                        counterRotationStyle,
                                    ], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.emoji, children: "\uD83D\uDD04" }) }) })] })] }))] }));
};
exports.DraggableView = DraggableView;
const styles = react_native_1.StyleSheet.create({
    draggableView: {
        position: 'absolute',
        backgroundColor: '#4A90E2',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selected: {
        borderWidth: 2,
        borderColor: '#FFD700',
        borderStyle: 'dashed',
    },
    defaultContent: {
        flex: 1,
        width: '100%',
        backgroundColor: 'transparent',
    },
    buttonContainer: {
        position: 'absolute',
        pointerEvents: 'box-none',
    },
    actionButton: {
        position: 'absolute',
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
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
        left: '50%',
        marginLeft: -BUTTON_SIZE / 2,
    },
    rightCenter: {
        right: 0,
        top: '50%',
        marginTop: -BUTTON_SIZE / 2,
    },
    emoji: {
        fontSize: 16,
    },
});
//# sourceMappingURL=DraggableView.js.map