"use client"

import { ControlButton, Panel, useReactFlow } from "@xyflow/react"
import {
  LucideLock,
  LucideMaximize,
  LucideMinus,
  LucidePlus,
  LucideUnlock,
} from "lucide-react"

interface Props {
  editable: boolean
  currentUserCanEdit: boolean
  onToggleEdit: () => void
}

/** Custom controls panel — RF's `<Controls>` builds an unkeyed children array (React 19 warning). */
export default function StructureControls({
  editable,
  currentUserCanEdit,
  onToggleEdit,
}: Props) {
  "use no memo"
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  return (
    <Panel
      position="bottom-left"
      className="react-flow__controls vertical"
      data-testid="rf__controls"
    >
      <ControlButton
        key="zoom-in"
        className="react-flow__controls-zoomin"
        onClick={() => void zoomIn()}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <LucidePlus className="h-3.5 w-3.5" />
      </ControlButton>
      <ControlButton
        key="zoom-out"
        className="react-flow__controls-zoomout"
        onClick={() => void zoomOut()}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <LucideMinus className="h-3.5 w-3.5" />
      </ControlButton>
      <ControlButton
        key="fit-view"
        className="react-flow__controls-fitview"
        onClick={() => void fitView()}
        title="Fit view"
        aria-label="Fit view"
      >
        <LucideMaximize className="h-3.5 w-3.5" />
      </ControlButton>
      <ControlButton
        key="toggle-edit"
        className="react-flow__controls-interactive"
        onClick={onToggleEdit}
        disabled={!currentUserCanEdit}
        title={editable ? "Lock editing" : "Unlock editing"}
        aria-label={editable ? "Lock editing" : "Unlock editing"}
      >
        {editable ? (
          <LucideUnlock className="h-3.5 w-3.5" />
        ) : (
          <LucideLock className="h-3.5 w-3.5" />
        )}
      </ControlButton>
    </Panel>
  )
}
