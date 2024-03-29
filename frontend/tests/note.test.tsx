import React from 'react';
import { describe, expect, it} from 'vitest';
import {screen, render, waitFor, fireEvent } from '@testing-library/react'
import Notes from '../src/features/Notes/components/Notes'
import { GlobalProvider } from '../src/context/GlobalContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach} from 'node:test';
import { MemoryRouter } from 'react-router';



describe('modifying individual notes', () => {
  const queryClient = new QueryClient()
  afterEach(() => {
    queryClient.clear();
  });


  it("note can be pinned and unpinned", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GlobalProvider>
            <Notes/>
          </GlobalProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getAllByLabelText(/note-item-[a-zA-Z | \d]+/).length).toBeTruthy()
    })

    const pinnedNote1 = screen.getByLabelText("pinned-for-note-1");
    fireEvent.click(pinnedNote1);

    await waitFor(() => {
      expect(screen.getAllByLabelText(/^pinned-for-[a-zA-Z | \d]+/).length).toBe(1)
      expect(screen.getAllByLabelText(/unpinned-for-[a-zA-Z | \d]+/).length).toBe(2)
    })

    const unpinnedNote1 = screen.getByLabelText("unpinned-for-note-1");

    fireEvent.click(unpinnedNote1);

    await waitFor(() => {
      expect(screen.getAllByLabelText(/^pinned-for-[a-zA-Z | \d]+/).length).toBe(2)
      expect(screen.getAllByLabelText(/unpinned-for-[a-zA-Z | \d]+/).length).toBe(1)
    })
  });

  it("note created upon correct trigger", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GlobalProvider>
            <Notes/>
          </GlobalProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getAllByLabelText(/note-item-[a-zA-Z | \d]+/).length).toBe(3)
    })

    const createNoteField = screen.getByLabelText("new-note-body")
    fireEvent.focus(createNoteField)
 
    const newNoteText = "This is a new note!";
    fireEvent.change(createNoteField, { target: { value: newNoteText } });
    await waitFor(() => {
      expect(createNoteField.textContent).toBe(newNoteText)
    })
    fireEvent.click(document.body);
    await waitFor(() => {
      expect(screen.getAllByLabelText(/note-item/).length).toBe(4)
    })
    screen.debug()
  });

  
  it("note content is mutable", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GlobalProvider>
            <Notes/>
          </GlobalProvider>
        </MemoryRouter> 
      </QueryClientProvider>
    )
    
    await waitFor(() => {
      expect(screen.getAllByLabelText(/note-item-[a-zA-Z | \d]+/).length).toBeTruthy()
    })

    const note1 = screen.getByLabelText("note-item-1");
    fireEvent.click(note1);

    const newNoteTitle = "New title!"
    const noteTitle: HTMLInputElement = screen.getByLabelText("active note title");
 
    fireEvent.focus(noteTitle)

    fireEvent.change(noteTitle, { target: { value: newNoteTitle } });
    
    await waitFor(() => {
      expect(noteTitle.value).toBe(newNoteTitle)
    })
    fireEvent.click(document.body);

    const noteTitleForNoteOne: HTMLInputElement = screen.getByLabelText("note-title-for-note-1");
    await waitFor(() => {
      expect(noteTitleForNoteOne.value).toBe(newNoteTitle)
    })
  });

  it("note disappears when patched", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GlobalProvider>
            <Notes/>
          </GlobalProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getAllByLabelText(/note-item-[a-zA-Z | \d]+/).length).toBe(4)
    })

    const note = screen.getByLabelText("note-item-1")
    fireEvent.mouseOver(note)
 
    const optionsButton = screen.getByLabelText("options-button-for-1")
    fireEvent.click(optionsButton)
    
    const deleteButton = screen.getByLabelText("trash-button-for-1")
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getAllByLabelText(/note-item-[a-zA-Z | \d]+/).length).toBe(3)
    })
    // screen.debug()
  });
});
