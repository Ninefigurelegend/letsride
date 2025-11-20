import { create } from 'zustand';
import { Event } from '@/types/models';

export type EventFilter = 'all' | 'public' | 'friends' | 'invited' | 'myEvents';

interface EventsState {
  // State
  events: Event[];
  selectedEvent: Event | null;
  filter: EventFilter;
  isLoading: boolean;
  error: string | null;

  // Actions
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, data: Partial<Event>) => void;
  removeEvent: (eventId: string) => void;
  setSelectedEvent: (event: Event | null) => void;
  setFilter: (filter: EventFilter) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  // Initial state
  events: [],
  selectedEvent: null,
  filter: 'all',
  isLoading: false,
  error: null,

  // Actions
  setEvents: (events) => set({ events, isLoading: false, error: null }),

  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events],
    })),

  updateEvent: (eventId, data) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, ...data } : event
      ),
      selectedEvent:
        state.selectedEvent?.id === eventId
          ? { ...state.selectedEvent, ...data }
          : state.selectedEvent,
    })),

  removeEvent: (eventId) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== eventId),
      selectedEvent:
        state.selectedEvent?.id === eventId ? null : state.selectedEvent,
    })),

  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),

  setFilter: (filter) => set({ filter }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      events: [],
      selectedEvent: null,
      filter: 'all',
      isLoading: false,
      error: null,
    }),
}));

