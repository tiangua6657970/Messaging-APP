import { ICode, ILogin, IRegister, ITheme, IUserinfo } from '@src/typeV2'
import { get, post } from '@src/service/base'

export const getServiceURL = (params: ICode) =>
  get<{ http: string; ws: string }>('chat/server', params)

export const register = (data: IRegister) => post<{ userinfo: IUserinfo }>('auth/register', data)
export const login = (data: ILogin) => post<{ userinfo: IUserinfo }>('auth/login', data)
export const bindTheme = () => post<{ userinfo: IUserinfo }>('auth/bind_theme', { code: 'M551021' })
export const getThemes = () => get<{ merchant: ITheme[] }>('auth/theme')
export const getChatToken = (data: { code: string; client_id: string }) =>
  post<string>('chat/auth', null, { params: data })
