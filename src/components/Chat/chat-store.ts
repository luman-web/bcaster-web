import { create } from 'zustand'
// types
import { State } from './state'

const useChatStore = create<State>()((set) => ({
  detail: null,
  activeTab: 'direct',
  setDetail: (chatId: string | null) => {
    set({ detail: chatId })
  },
  setActiveTab: (tab) => {
    set({ activeTab: tab })
  },
}))

export default useChatStore
