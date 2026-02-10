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
  const [gridWidth, setGridWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (gridRef.current) {
        setGridWidth(gridRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (fields.length === 0) return null;

  return (
    <div ref={gridRef} className="w-full h-auto field-grid-container">
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
