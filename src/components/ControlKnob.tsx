import React from "react";
import Knob from "react-canvas-knob";
import styles from "../../styles/ControlKnob.css";

interface propTypes {
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  title: string;
  value: number;
  disabled?: boolean;
}

export default function ControlKnob({
  value,
  min,
  max,
  onChange,
  step,
  title,
  disabled = false
}: propTypes) {
  return (
    <label className={styles.ControlKnobLabel}>
      <span>{title}</span>
      <Knob
        max={max}
        min={min}
        onChange={onChange}
        onChangeEnd={onChange}
        readOnly={disabled}
        step={step}
        title={title}
        value={value}
        angleArc={90 * 3}
        angleOffset={90 * 2.5}
        bgColor={disabled ? "#666" : "#FFF"}
        disableTextInput
        height={80}
        inputColor={disabled ? "#666" : "#FFF"}
        lineCap="butt"
        thickness={0.5}
        width={80}
      />
    </label>
  );
}
