export interface ICode {
  code: string
}

export interface ILogin {
  username: string
  password: string
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
  phone: string
  sex: number
  password: string
  trade_password: string
  money: string
  freeze_money: string
  point: number
  type: number
  status: number
  create_time: number
  circli_img: string
  is_customer_service: number
  agent_id: number
  update_time: number
  client_id: string
  q_permition: number
  tj_username: string
  ip: string
  ip_cityname: string
  ip_status: number
  phone_status: number
  phone_type: number
  is_robot: number
  storge: number
  level: number
  renewal_time: number
  is_validate: number
  unique_code: number
  invite_code: number
  parent_id: number
  hands_password: null | string
  push_client_id: string[]
  avatar: string
  invitation: null | any
  circle_img: string
  face: string
  photo: string
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
  avatar: string
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
  id: string
  type: number
  typeText: MessageType
  time: number
  trans_id: string
  is_niming: number
  content: {
    text: string
    answerMsgText: string
    answerMsgId: string
    url: string
    length: number
    w: number
    h: number
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
