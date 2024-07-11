import axios, { Method, AxiosRequestConfig } from 'axios'
import useAuthStore from "@src/store/auth";

export const showMessage = (status: number | string): string => {
  let message = ''
  switch (status) {
    case 400:
      message = '请求错误(400)'
      break
    case 401:
      message = '未授权，请重新登录(401)'
      break
    case 403:
      message = '拒绝访问(403)'
      break
    case 404:
      message = '请求出错(404)'
      break
    case 408:
      message = '请求超时(408)'
      break
    case 500:
      message = '服务器错误(500)'
      break
    case 501:
      message = '服务未实现(501)'
      break
    case 502:
      message = '网络错误(502)'
      break
    case 503:
      message = '服务不可用(503)'
      break
    case 504:
      message = '网络超时(504)'
      break
    case 505:
      message = 'HTTP版本不受支持(505)'
      break
    default:
      message = `连接出错(${status})!`
  }
  return `${message}，请检查网络或联系管理员！`
}

const serviceConfig = {
  timeout: 3000,
  baseURL: 'https://b.0p0.cn/api/v1/',
  // baseURL: 'http://btest.0p0.cn/api/v1/'
  // baseURL: '/api/v1/'
}

axios.defaults.timeout = serviceConfig.timeout
axios.defaults.baseURL = serviceConfig.baseURL
axios.interceptors.request.use(
  config => {
    const authStore = useAuthStore()

    config.headers['account-token'] = authStore.token
    return config
  },
  error => {
    console.log(error)
  }
)
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    return error.response
  }
)

export function request<R>(
  url: string,
  params: any = {},
  requestMethod: Method = 'GET',
  config: AxiosRequestConfig = {
    headers: {
      'Accept-Language': 'zh-CN,zh;q=0.9'
    }
  }
) {
  return axios
    .request<R & { code: number, msg: string, data: any, err: number }>({
      url,
      method: requestMethod,
      [requestMethod === 'GET' ? 'params' : 'data']: params,
      ...config
    })
    .then(res => {
      if (res.status !== 200) {
        return { err: 1, data: undefined, msg: res.data.msg } as { err: number; msg: string; data: R }
      }
      return { err: res.data.err, msg: res.data.msg, data: res.data.data } as { err: number; msg: string; data: R }
    })
    .catch(err => {
      console.log('[service err] :', err)
      return { err: 1, data: undefined } as { err: number; msg: string; data: R }
    })
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function get<R, P = {}>(url: string, params?: P) {
  return request<R>(url, params, 'GET')
}

export function post<R>(url: string, data: object | null = {}, config?: AxiosRequestConfig) {
  return request<R>(url, data, 'POST', config)
}
