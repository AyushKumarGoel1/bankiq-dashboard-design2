import { createContext, useContext, useRef, useCallback, useState } from 'react';

const DragContext = createContext(null);

export function DragProvider({ children }) {
  const payloadRef = useRef(null);
  const [droppedPayload, setDroppedPayload] = useState(null);

  const setDragPayload = useCallback((p) => { payloadRef.current = p; }, []);
  const getDragPayload = useCallback(() => payloadRef.current, []);
  const commitDrop = useCallback(() => {
    if (payloadRef.current) {
      setDroppedPayload({ ...payloadRef.current, _ts: Date.now() });
      payloadRef.current = null;
    }
  }, []);
  const clearDropped = useCallback(() => setDroppedPayload(null), []);

  return (
    <DragContext.Provider value={{ setDragPayload, getDragPayload, commitDrop, droppedPayload, clearDropped }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDragContext() { return useContext(DragContext); }

// Hook for draggable components
export function useDraggable({ title, summary, data, questions }) {
  const { setDragPayload } = useDragContext();
  const [dragging, setDragging] = useState(false);

  const dragProps = {
    draggable: true,
    onDragStart: (e) => {
      setDragging(true);
      setDragPayload({ title, summary, data, questions });
      e.dataTransfer.effectAllowed = 'copy';
    },
    onDragEnd: () => setDragging(false),
  };
  return { dragProps, dragging };
}
