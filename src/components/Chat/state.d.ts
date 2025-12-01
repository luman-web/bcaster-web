export type ChatTab = 'direct' | 'group' | 'events';

export type State = {
  detail: string | null;
  activeTab: ChatTab;
  setDetail: (chatId: string | null) => void;
  setActiveTab: (tab: ChatTab) => void;
}