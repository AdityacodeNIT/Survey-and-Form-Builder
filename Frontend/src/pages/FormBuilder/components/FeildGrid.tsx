import { useRef, useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import FieldCard from "./FeildCard";
import type { Field } from "../../../types";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface Props {
  fields: Field[];
  selectedFieldId: string | null;
  setSelectedFieldId: (id: string) => void;
  removeField: (id: string) => void;
  setFields: (f: Field[]) => void;
}

export default function FieldGrid({ fields, selectedFieldId, setSelectedFieldId, removeField, setFields }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(1200); // Set default width
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      if (gridRef.current) {
        setGridWidth(gridRef.current.offsetWidth);
      }
    };

    // Update immediately
    updateWidth();
    
    // Also update after a short delay to ensure DOM is ready
    const timer = setTimeout(updateWidth, 100);
    
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
      clearTimeout(timer);
    };
  }, []);

  // Recalculate width when fields change
  useEffect(() => {
    if (gridRef.current && fields.length > 0) {
      const timer = setTimeout(() => {
        setGridWidth(gridRef.current!.offsetWidth);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [fields.length]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const fieldType = e.dataTransfer.getData('fieldType');
    if (fieldType) {
      // Trigger the parent's addField function through a custom event
      const event = new CustomEvent('addFieldFromDrop', { detail: { fieldType } });
      window.dispatchEvent(event);
    }
  };

  if (fields.length === 0) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`text-center py-20 border-2 border-dashed rounded-xl transition-all duration-300 ${
          isDraggingOver
            ? 'border-slate-400 bg-gradient-to-br from-slate-50 to-blue-50 scale-[1.02] shadow-lg'
            : 'border-gray-300 bg-gradient-to-br from-white to-slate-50'
        }`}
      >
        <div className={`transition-all duration-300 ${isDraggingOver ? 'scale-110' : 'scale-100'}`}>
          <svg className={`w-20 h-20 mx-auto mb-4 transition-colors ${isDraggingOver ? 'text-slate-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className={`font-semibold text-lg transition-colors ${isDraggingOver ? 'text-slate-700' : 'text-gray-500'}`}>
            {isDraggingOver ? 'Release to add field' : 'Drop a field here'}
          </p>
          <p className="text-sm text-gray-400 mt-2">Drag a field type from above and drop it here</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={gridRef} 
      className={`w-full h-auto field-grid-container transition-all duration-300 rounded-xl ${
        isDraggingOver ? 'ring-2 ring-slate-400 ring-offset-2 bg-slate-50/50' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <GridLayout
        {...{
          layout: fields.map((f, i) => ({
            i: f.id,
            x: 0,
            y: i,
            w: 12,
            h: 0.7,
          })),
          cols: 12,
          rowHeight: 72,
          margin: [0, 6],
          containerPadding: [0, 0],
          width: gridWidth,
          isResizable: false,
          draggableHandle: ".drag-handle",
          onDragStop: (layout: any) => {
            const reordered = [...fields].sort(
              (a, b) =>
                layout.find((l: any) => l.i === a.id)!.y -
                layout.find((l: any) => l.i === b.id)!.y
            );
            setFields(reordered);
          },
        } as any}
      >
        {fields.map((f, i) => (
          <div key={f.id}>
            <FieldCard
              field={f}
              index={i}
              isSelected={selectedFieldId === f.id}
              onSelect={() => setSelectedFieldId(f.id)}
              onRemove={() => removeField(f.id)}
            />
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
