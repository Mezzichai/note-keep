import { useMutation, useQueryClient, } from "@tanstack/react-query"
import { archiveOnNote, createNote, deleteNote, restoreOnNote, togglePinOnNote, trashOnNote, updateNoteContents, updateNoteLabels,} from "../noteServices"
import { useNotes } from "../../context/NoteContext"
import { useParams } from "react-router"
import { LabelType, NoteType, NotesData } from "../../interfaces"
import { removeNote } from "../optimisticUpdates"

const useSingleNoteMutation = (boundNote: NoteType = {_id: 0, labels: [], isPinned: false, isTrashed:  false, isArchived:  false}) => {
  const queryClient = useQueryClient()
  const {query, currentLabel} = useNotes()
  const {labelId} = useParams()

  
  const toggleNotePin = useMutation({
    mutationFn: () => togglePinOnNote(boundNote._id, !boundNote.isPinned),
    onMutate: () => {
      const previousNotes = queryClient.getQueryData(['notes', labelId, query]);
      queryClient.setQueryData(['notes', labelId, query], (prevNotes: NotesData) => {
        if (boundNote.isPinned) {
          const newPinnedNotes = prevNotes.pinnedNotes.filter(note => note._id !== boundNote._id);
          const newPlainNotes = [...prevNotes.plainNotes, {...boundNote, isPinned: false}];
          return {pinnedNotes: newPinnedNotes, plainNotes: newPlainNotes};
        } else {
          const newPlainNotes = prevNotes.plainNotes.filter(note => note._id !== boundNote._id);
          const newPinnedNotes = [...prevNotes.pinnedNotes, {...boundNote, isPinned: true}];
          return {pinnedNotes: newPinnedNotes, plainNotes: newPlainNotes};
        }
      })
      return { previousNotes }
    },
    onError: (err, newNotes, context) => {
      queryClient.setQueryData(['notes', labelId, query], context?.previousNotes)
    }
  })

  
  const noteArchive = useMutation({
    mutationFn: () => {
      return archiveOnNote(boundNote._id)
    },
    onMutate: () => {
      const previousNotes = queryClient.getQueryData(['notes', labelId, query])
      
      queryClient.setQueryData(['notes', labelId, query], (prevNotes: NotesData) => {
        return removeNote(boundNote._id, prevNotes)
      })
      return { previousNotes }
    },
    onError: (err, newNotes, context) => {
      queryClient.setQueryData(['notes', labelId, query], context?.previousNotes)
    },
  })


  const noteTrash = useMutation({
    mutationFn: () => {
      return trashOnNote(boundNote._id)
    },
    onMutate: () => {
      const previousNotes = queryClient.getQueryData(['notes', labelId, query])
      
      queryClient.setQueryData(['notes', labelId, query], (prevNotes: NotesData) => {
        return removeNote(boundNote._id, prevNotes)
      })
      return { previousNotes }
    },
    onError: (err, newNotes, context) => {
      queryClient.setQueryData(['notes', labelId, query], context?.previousNotes)
    },
  })


  const noteRestore = useMutation({
    mutationFn: () => {
      return restoreOnNote(boundNote._id)
    },
    onMutate: () => {
      const previousNotes = queryClient.getQueryData(['notes', labelId, query])
      
      queryClient.setQueryData(['notes', labelId, query], (prevNotes: NotesData) => {
        return removeNote(boundNote._id, prevNotes)
      })
      return { previousNotes }
    },
    onError: (err, newNotes, context) => {
      queryClient.setQueryData(['notes', labelId, query], context?.previousNotes)
    },
  })


  const noteDelete = useMutation({
    mutationFn: () => {
      return deleteNote(boundNote._id)
    },
    onMutate: () => {
      const previousNotes = queryClient.getQueryData(['notes', labelId, query])
      
      queryClient.setQueryData(['notes', labelId, query], (prevNotes: NotesData) => {
        return removeNote(boundNote._id, prevNotes)
      })
      return { previousNotes }
    },
    onError: (err, newNotes, context) => {
      queryClient.setQueryData(['notes', labelId, query], context?.previousNotes)
    },
  })


  type NotesDetails = {
    title?: string;
    body?: string;
    labels: LabelType[] 
  }

  const noteCreate = useMutation({
    mutationFn: (content: NotesDetails) => {
      return createNote(content.labels, content.title, content.body);
    },
    onMutate: (content) => {
      const previousNotes = queryClient.getQueryData(['notes', labelId, query]);
      
      queryClient.setQueryData(['notes', labelId, query], (prevNotes: NotesData) => {
        const newPlainNotes = [...prevNotes.plainNotes, {title: content.title, body: content.body, labels: content.labels}];
        return {...prevNotes, plainNotes: newPlainNotes };
      });
      return { previousNotes };
    },
    onError: (err, newNotes, context) => {
      queryClient.setQueryData(['notes', labelId, query], context?.previousNotes);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', labelId, query] })
    },
  })


  type NoteContents = {
    title: string;
    body: string;
  }

  const noteContentUpdate = useMutation({
    mutationFn: (contents: NoteContents) => {
      return updateNoteContents(boundNote._id, contents.title, contents.body)
    },
    onMutate: () => {
      const previousNotes = queryClient.getQueryData(['notes', labelId, query])
      
      queryClient.setQueryData(['notes', labelId, query], (prevNotes: NotesData) => {
        return removeNote(boundNote._id, prevNotes)
      })
      return { previousNotes }
    },
    onError: (err, newNotes, context) => {
      queryClient.setQueryData(['notes', labelId, query], context?.previousNotes)
    },
  })


  const noteLabelUpdate = useMutation({
    mutationFn: (labels: LabelType[]) => {
      return updateNoteLabels(boundNote._id, labels)
    },
    onMutate: (labels) => {
      const previousNotes = queryClient.getQueryData(['notes', labelId, query])
      queryClient.setQueryData(['notes', labelId, query], (prevNotes: NotesData) => {
        if (!labels.some(label => label._id === currentLabel._id)) {
          return removeNote(boundNote._id, prevNotes);
        }
        const noteInPinnedNotes = prevNotes.pinnedNotes.find(note => note._id === boundNote._id);
        if (noteInPinnedNotes) {
          const pinnedNotes = prevNotes.pinnedNotes.map(note => {
            if (note._id === boundNote._id) {
              return {...note, labels: labels}
            }
            return note
          })
          return {...prevNotes, pinnedNotes: [...pinnedNotes]}
        } else {
          const plainNotes = prevNotes.plainNotes.map(note => {
            if (note._id === boundNote._id) {
              return {...note, labels: labels}
            }
            return note
          })
          console.log(plainNotes)

          return {...prevNotes, plainNotes: [...plainNotes]}
        }       
      })
      return { previousNotes }
    },
    onError: (err, newNotes, context) => {
      queryClient.setQueryData(['notes', labelId, query], context?.previousNotes)
    },
  })

  return {toggleNotePin, noteTrash, noteArchive, noteRestore, noteDelete, noteContentUpdate, noteLabelUpdate, noteCreate}
}



export default useSingleNoteMutation