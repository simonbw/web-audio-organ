import React, { ReactNode, ReactChild } from "react";
import { keyToNote, keyToRank, MIN_NOTE, MAX_NOTE } from "../keyboard";
import styles, { Note } from "../../styles/Notes.css";
import classnames from "classnames";
import { range } from "../audio/util";
import { noteToName, isWhiteNote } from "../audio/notes";

interface Props {
  play: (note: number) => void;
  stop: (note: number) => void;
  notes: { [note: number]: boolean };
}

export default class NotesController extends React.Component<Props> {
  mouseIsDown: boolean = false;
  keysDown: { [note: number]: boolean } = {};
  touching: Set<number> = new Set();

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("mouseup", this.onMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);
    document.removeEventListener("mouseup", this.onMouseUp);
  }

  onKeyDown = (event: KeyboardEvent) => {
    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      const note = keyToNote(event.code);
      if (note !== null) {
        this.keysDown[note] = true;
        this.props.play(note);
        event.preventDefault();
      }
    }
  };

  onKeyUp = (event: KeyboardEvent) => {
    const note = keyToNote(event.code);
    if (note !== null) {
      this.keysDown[note] = false;
      this.props.stop(note);
      event.preventDefault();
    }
  };

  onMouseUp = (event: { button: number }) => {
    if (event.button === 0) {
      this.mouseIsDown = false;
    }
  };

  handleTouches = (event: React.TouchEvent<any>): void => {
    const newNotes = new Set<number>();
    for (const touch of Array.from(event.touches)) {
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element && (element as any).dataset.note !== undefined) {
        newNotes.add((element as any).dataset.note);
      }
    }
    for (const oldNote of this.touching) {
      if (!newNotes.has(oldNote) && !this.keysDown[oldNote]) {
        this.props.stop(oldNote);
      }
    }
    for (const newNote of newNotes) {
      if (!this.touching.has(newNote) && !this.keysDown[newNote]) {
        this.props.play(newNote);
      }
    }
    this.touching = newNotes;
  };

  render() {
    return (
      <div className={styles.NotesContainer}>
        <div
          className={styles.Notes}
          onTouchCancel={this.handleTouches}
          onTouchEnd={this.handleTouches}
          onTouchMove={this.handleTouches}
          onTouchStart={this.handleTouches}
        >
          {range(MIN_NOTE, MAX_NOTE).map(note => (
            <div
              key={note}
              className={classnames(
                styles.Note,
                { [styles.active]: this.props.notes[note] },
                isWhiteNote(note) ? styles.white : styles.black
              )}
              data-note={note}
              onContextMenu={event => event.preventDefault()}
              onMouseDown={event => {
                if (event.button === 0) {
                  this.props.play(note);
                  this.mouseIsDown = true;
                }
              }}
              onMouseUp={event => {
                if (event.button === 0 && !this.keysDown[note]) {
                  this.props.stop(note);
                }
              }}
              onMouseLeave={() => {
                if (this.mouseIsDown && !this.keysDown[note]) {
                  this.props.stop(note);
                }
              }}
              onMouseEnter={() => {
                if (this.mouseIsDown) {
                  this.props.play(note);
                }
              }}
              title={noteToName(note)}
            >
              <span className={styles.Label} data-note={note}>
                {noteToName(note)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
