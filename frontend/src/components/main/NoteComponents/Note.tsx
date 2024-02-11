import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import NoteStyles from './NoteStyles.module.css';
import MainStyles from '../MainStyles.module.css'
import NoteModal from './NoteModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faCheck, faEllipsisVertical, faMapPin, faTrash, faTrashRestore, faUndo, faX } from '@fortawesome/free-solid-svg-icons';
import { useNotes } from '../../../context/NoteContext';
import OptionsModal from '../Multiselect-components/OptionsModal';
import { NoteType } from '../../../interfaces';
import { useParams } from 'react-router-dom';
import { NOTE_TOGGLE_CLICKED } from '../../../reducers/selectedNotesReducer';
import useSingleNoteMutation from '../../../services/queryHooks/useSingleNoteMutation';
import { Query, useQueryClient } from '@tanstack/react-query';
import useNotesQuery from '../../../services/queryHooks/useNotesQuery';
// import useClickOutside from '../../../hooks/useClickOutside';
interface Props {
  note: NoteType;
}

const Note: React.FC<Props> = ({ note }) => {
  const [noteState, setNoteState] = useState<boolean>(false);
  const [noteHoverState, setNoteHoverState] = useState<boolean>(false);
  const [optionsModalState, setOptionsModal] = useState<boolean>(false);
  const {selectedNotesState, dispatchSelectedNotes} = useNotes()
  const {notes: selectedNotes} = selectedNotesState
  const selectedNoteIds = selectedNotes.map(note => note._id)
  const {toggleNotePin, noteTrash, noteArchive, noteRestore, noteDelete} = useSingleNoteMutation(note)
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const optionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null)
  const {query, currentLabel} = useNotes()
  const {labelId} = useParams()
  
  // useLayoutEffect(() => {
  //   if (textareaRef.current) {
  //     // Calculate the scroll height of the textarea content
  //     const scrollHeight = textareaRef.current.scrollHeight;
  //     // Set the textarea height to the scroll height
  //     textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
  //   }
  // }, [note.body]);


  const handleSelectNoteToggle = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    dispatchSelectedNotes({type: NOTE_TOGGLE_CLICKED, payload: note})
  }

  const handleOptionClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (!optionsModalState) {
      setOptionsModal(true);
    } 
  }

  const handleNotePinToggle = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    toggleNotePin.mutate();
  };

  const handleArchive = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    noteArchive.mutate();
  }

  const handleTrash = (e: React.MouseEvent) => {
    e.stopPropagation();
    noteTrash.mutate();
  }

  const handleRestore = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    noteRestore.mutate();
  }

  const handleDelete = (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e?.stopPropagation();
    noteDelete.mutate();
  }
  
  const handleMouseLeave = () => {
    if (!optionsModalState) {
      setNoteHoverState(false);
    } 
  }

  // useClickOutside(containerRef, [noteHoverState, optionsModalState], [setNoteHoverState, setOptionsModal])
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     setTimeout(()=> {
  //       if ((containerRef.current && !containerRef.current.contains(event.target as Node))) {
  //         setNoteHoverState(false);
  //         setOptionsModal(false);
  //       }
  //     }, 100)
  //   };
  
  //   document.addEventListener("mousedown", handleClickOutside);
   
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };  
  // }, []);


  //determines whether we should show a checkmark on a note
  const shouldNoteShowCheckMark = () => {
    if (noteHoverState && selectedNoteIds.includes(note._id)) {
      return false
    } else {
      return true
    }
  }

  return (
    <div className={NoteStyles.container} ref={containerRef}>
      {noteState && <NoteModal handleDelete={handleDelete} note={note} setNoteState={setNoteState} noteState={noteState} />}

      <div
        className={NoteStyles.note}
        onClick={() => !noteState ? handleFocus() : null}
        onMouseEnter={() => setNoteHoverState(true)}
        onMouseLeave={() => handleMouseLeave()}
      >
        {(noteHoverState || selectedNoteIds.includes(note._id)) && (
          <div className={NoteStyles.check}>
            <button className={NoteStyles.options} id={NoteStyles.check} onClick={(e) => handleSelectNoteToggle(e)}>
              <FontAwesomeIcon icon={shouldNoteShowCheckMark() ? faCheck : faX} />
            </button>
          </div>
        )}


        {/* make into component */}
        {(note.isPinned && !["Trash", "Archive", "Query"].includes(labelId || "")) ? (
          <div className={NoteStyles.pin}>
            <button className={NoteStyles.options} id={NoteStyles.removePin} onClick={(e)=>handleNotePinToggle(e)}>
              <FontAwesomeIcon icon={faMapPin} />
            </button>
          </div>
        ) : (noteHoverState && !["Trash", "Archive", "Query"].includes(labelId || "")) ? (
          <div className={NoteStyles.pin}>
            <button className={NoteStyles.options} onClick={(e)=>handleNotePinToggle(e)}>
              <FontAwesomeIcon icon={faMapPin} />
            </button>
          </div>
        ) : null}


        <input
          className={MainStyles.titleInput}
          placeholder="Title"
          type="text"
          value={note.title || ''}
          readOnly
        />
        <textarea
          placeholder="Take a note..."
          className={NoteStyles.bodyInput}
          ref={textareaRef}
          value={note.body || ''}
          readOnly
        />
        {optionsModalState && <OptionsModal notes={[note]} setOptionsModal={setOptionsModal} optionRef={optionRef} />}

        

        {/* refactor to component */}
        {(noteHoverState && !["Trash", "Archive"].includes(labelId || "")) ? (
          <div className={NoteStyles.tools} ref={optionRef}>
             <button className={NoteStyles.options} onClick={(e)=>handleArchive(e)}>
              <FontAwesomeIcon icon={faArchive} />
            </button>
            <button className={NoteStyles.options} onClick={(e)=>handleOptionClick(e)}>
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
          </div>
        ) : (noteHoverState && labelId === "Trash") ? (
          <div className={NoteStyles.tools} ref={optionRef}>
            <button className={NoteStyles.options} onClick={(e)=>handleRestore(e)}>
              <FontAwesomeIcon icon={faTrashRestore} />
            </button>
            <button className={NoteStyles.options} onClick={(e)=>handleDelete(e)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <button className={NoteStyles.options} onClick={(e)=>handleArchive(e)}>
              <FontAwesomeIcon icon={faArchive} />
            </button>
          </div>
        ) : (noteHoverState && labelId === "Archive") ? (
        <div className={NoteStyles.tools} ref={optionRef}>
          <button className={NoteStyles.options} onClick={(e)=>handleRestore(e)}>
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button className={NoteStyles.options} onClick={(e)=>handleTrash(e)}>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
       ) : null}
      </div>
    </div>
  );
};

export default Note;