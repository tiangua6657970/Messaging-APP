export interface ICode {
  code: string
}

export interface ILogin {
  username: string
  password: string
}

export interface IRegister {
  username: string
  password: string
  email: string
}

export interface IUserinfo {
  id: number
  username: string
  nickname: string
  email: string
  mobile: string
  avatar: string
  score: number
  token: string
  user_id: number
  expires_in: number
}

export interface ITheme {
  url: string
  title: string
  icon_image: string
  url_type: string
  url_file: string
  url_version: string
  is_hide_tabbar: number
  describe: string
  enable: number
  show: number
  current: number
  code: string
  type: number
  project_name: string
  name: string
  create_time: number
}

export type SocketAction =
  | 'checkToken'
  | 'chatData'
  | 'deleteChat'
  | 'removeGroup'
  | 'banChat'
  | 'newFriend'
  | 'getFriendList'
  | 'chatGroupApply'
  | 'offline'
  | 'readReceipt'
  | 'vedioData'
  | 'cancleVedio'
  | 'zhenDong'
  | 'getChatList'
  | 'memberIsOnline'

export interface IChatUserinfo {
  id: number
  username: string
  nickname: string
  doodling: string
  email: string
  sex: number
  password: string
  is_customer_service: number
  is_validate: number
  unique_code: number
  avatar: string
}

export interface IBaseInfo {
  new_friend_tips_num: number
  new_group_tips_num: number
}

export interface IChat {
  list_id: string
  last_chat_time: number
  chat_id: string
  no_reader_num: number
  show_name: string
  last_msg: string
  mentionUid: string
  content_type: number
  photo_path: string
  avatar: string
  time: string
  top: number
  top_time: number | null
  type: number
  messageType: MessageType
  group_type: string
  is_customer_service: number
  live: null | any
  draftMessage: string
}

export interface IImageEmoji {
  id: number
  user_id: number
  url: string
  w: string
  h: string
  create_time: string
  update_time: number
}

export interface IFriend {
  photo: string
  user_id: number
  name: string
  avatar: string,
  checked: boolean
}

export interface LetterData {
  letter: string
  data: IFriend[]
  index: number
}

export interface IFriendMap {
  [key: string]: LetterData
}

export interface IContactGroup {
  letter: string
  data: IFriend[]
}

export type SidebarComponentName =
  | 'messages'
  | 'contacts'
  | 'notifications'
  | 'phone'
  | 'settings'

export interface IMessageV2 {
  id: number
  type: number
  messageType: MessageType
  time: number
  trans_id: string
  is_niming: number
  self: boolean
  content: {
    text: string
    answerMsgText: string
    answerMsgId: number
    mentionUid: string
    url: string
    fullURL: string
    length: number
    w: number
    h: number
    nickname: string
    user_id: number
    avatar: string
  }
  user_info: {
    uid: number
    name: string
    face: string
    level_name: ''
    nickname: string
    avatar: string
  }
}

export interface ISocketMessage {
  list_id: string
  content_type: number
  content: {
    text?: string
    answerMsgText?: string
    answerMsgId?: number
    mentionUid?: string
    url?: string
    length?: number
    w?: number
    h?: number
  }
}

export type MessageType =
  | 'text'
  | 'voice'
  | 'image'
  | 'video'
  | 'file'
  | 'redPacket'
  | 'onlineVideo'
  | 'onlineVoice'
  | 'nameCard'
  | 'poke'
  | 'location'
  | 'officialPush'
  | 'note'
  | 'audioFile'

export interface IMessageWrapper {
  type: number
  msg: IMessageV2
}

export interface uploadResult {
  path: string
}

export interface IReadReceipt {
  open_session_time: number
}

export interface IMember {
  user_id: number
  show_name: string,
  name: string
  photo: string
  is_admin: number
  is_online: number
  avatar: string
  checked: boolean
}

export interface IGroup {
  list_id: string
  main_id: number
  can_niming: number
  need_check: number
  can_add_friend: number
  group_type: string
  name: string
  agent_id: string
  keywords: string
  notice: string
  is_msg: number
  is_photo: string
  edit_photo: number
  can_get_bigred: number
  can_shangmai: number
  avatar: string
  id: string
}

export interface IChatInfo {
  member: IMember[]
  type: number
  group: IGroup
  is_action: number
  my_nickname: string
  top: number
  is_disturb: number
  user_id: number
  can_add_friend: number
}

export interface IFriendRequest {
  id: string
  user_id: number
  content: string
  text: string
  photo: string
  nickname: string
  avatar: string
}

export interface IGroupJoinRequest {
  id: string
  user_id: number
  content: string
  text: string
  photo: string
  nickname: string
  avatar: string
  status: number
}

// {
//   "user_id": 6579,
//   "show_name": "Cloud-1",
//   "photo": "user/6579/90.jpg",
//   "is_admin": 0,
//   "is_online": 1,
//   "avatar": "M551021/photo/user/6579/90.jpg"
// }
export interface IViewConcatInfo {
  top: boolean
  name: string
  avatar: string
  user_id: number
  is_online: boolean
}

export interface IContactInfo {
  user_id: number;
  nickname: string;
  is_validate: number;
  username: string;
  is_friend: number;
  doodling: string;
  avatar: string;
  common_group_number: number;
  from: string;
  content: string;
  sex: number;
  apply_id: number;
  unique_code: number;
}