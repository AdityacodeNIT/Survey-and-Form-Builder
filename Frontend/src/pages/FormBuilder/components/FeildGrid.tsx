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
  const [gridWidth, setGridWidth] = useState(1200);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (gridRef.current) {
        setGridWidth(gridRef.current.offsetWidth);
      }
    };

    updateWidth();
    const timer = setTimeout(updateWidth, 100);
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
      clearTimeout(timer);
    };
  }, []);

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
      const event = new CustomEvent('addFieldFromDrop', { detail: { fieldType } });
      window.dispatchEvent(event);
    }
  };

  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...fields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    setFields(newFields);
  };

  const moveFieldDown = (index: number) => {
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    setFields(newFields);
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
          <p className="text-sm text-gray-400 mt-2">{isMobile ? 'Click a field type above to add' : 'Drag a field type from above and drop it here'}</p>
        </div>
      </div>
    );
  }

  // Mobile view with up/down buttons
  if (isMobile) {
    return (
      <div 
        ref={gridRef} 
        className="w-full space-y-2"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {fields.map((f, i) => (
          <div key={f.id} className="flex items-stretch gap-2">
            {/* Up/Down buttons on the left */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  moveFieldUp(i);
                }}
                disabled={i === 0}
                className="p-1.5 bg-slate-600 text-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                aria-label="Move up"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  moveFieldDown(i);
                }}
                disabled={i === fields.length - 1}
                className="p-1.5 bg-slate-600 text-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                aria-label="Move down"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* Field card */}
            <div className="flex-1 min-w-0">
              <FieldCard
                field={f}
                index={i}
                isSelected={selectedFieldId === f.id}
                onSelect={() => setSelectedFieldId(f.id)}
                onRemove={() => removeField(f.id)}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop view with drag and drop
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
