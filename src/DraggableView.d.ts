import React from 'react';
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
export declare const DraggableView: React.FC<DraggableViewProps>;
export {};
//# sourceMappingURL=DraggableView.d.ts.map