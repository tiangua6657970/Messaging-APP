// @ts-nocheck

import { MessageType } from '@src/typeV2'
import Swal from 'sweetalert2'

export function randomStr(loop: number) {
  let str = ''
  for (let i = 0; i < loop; i++) {
    str += Math.random().toString(36).slice(-8)
  }
  return str
}

export function toFriendlyTimeEn(timestamp) {
  const now = new Date()
  const date = new Date(timestamp)
  const secondsAgo = Math.floor((now - date) / 1000)

  // 判断是否在今天
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    // 小于1分钟，显示刚刚
    if (secondsAgo < 60) {
      return 'Just now'
    }

    // 大于1分钟小于60分钟，显示具体几分钟前
    if (secondsAgo < 60 * 60) {
      const minutes = Math.floor(secondsAgo / 60)
      return `${minutes} Minutes ago`
    }

    // 大于60分钟小于2小时，显示具体几小时+分钟前
    if (secondsAgo < 60 * 60 * 2) {
      const hours = Math.floor(secondsAgo / (60 * 60))
      const minutes = Math.floor((secondsAgo - hours * 60 * 60) / 60)
      return `${hours} Hour ${minutes} Minutes ago`
    }

    // 超过2小时，显示具体的几点几分
    const ampm = date.getHours() >= 12 ? 'Afternoon' : 'Morning'
    const hour = date.getHours() % 12 || 12
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${ampm} ${hour}:${minute}`
  }

  // 不在今天，判断是否在两天内
  const oneDayMs = 24 * 60 * 60 * 1000
  if (now - date < oneDayMs * 2) {
    if (
      date.getDate() === now.getDate() - 1 &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      // 昨天
      const ampm = date.getHours() >= 12 ? 'Afternoon' : 'Morning'
      const hour = date.getHours() % 12 || 12
      const minute = date.getMinutes().toString().padStart(2, '0')
      return `Yesterday ${ampm} ${hour}:${minute}`
    } else {
      // 前天
      const ampm = date.getHours() >= 12 ? 'Afternoon' : 'Morning'
      const hour = date.getHours() % 12 || 12
      const minute = date.getMinutes().toString().padStart(2, '0')
      return `The day before yesterday ${ampm} ${hour}:${minute}`
    }
  }

  // 不在两天内，判断是否在同一周
  const oneWeekMs = oneDayMs * 7
  const diffMs = now - date
  if (diffMs < oneWeekMs) {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ]
    const ampm = date.getHours() >= 12 ? 'Afternoon' : 'Morning'
    const hour = date.getHours() % 12 || 12
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${days[date.getDay()]} ${ampm} ${hour}:${minute}`
  }

  // 不在同一周，显示具体年月日+时间
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const ampm = date.getHours() >= 12 ? 'Afternoon' : 'Morning'
  const hour = date.getHours() % 12 || 12
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${ampm} ${hour}:${minute}`
}

export function toFriendlyTime(timestamp) {
  const now = new Date()
  const date = new Date(timestamp)
  const secondsAgo = Math.floor((now - date) / 1000)

  // 判断是否在今天
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    // 小于1分钟，显示刚刚
    if (secondsAgo < 60) {
      return '刚刚'
    }

    // 大于1分钟小于60分钟，显示具体几分钟前
    if (secondsAgo < 60 * 60) {
      const minutes = Math.floor(secondsAgo / 60)
      return `${minutes}分钟前`
    }

    // 大于60分钟小于2小时，显示具体几小时+分钟前
    if (secondsAgo < 60 * 60 * 2) {
      const hours = Math.floor(secondsAgo / (60 * 60))
      const minutes = Math.floor((secondsAgo - hours * 60 * 60) / 60)
      return `${hours}小时 ${minutes}分钟前`
    }

    // 超过2小时，显示具体的几点几分
    const ampm = date.getHours() >= 12 ? '下午' : '上午'
    const hour = date.getHours() % 12 || 12
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${ampm} ${hour}:${minute}`
  }

  // 不在今天，判断是否在两天内
  const oneDayMs = 24 * 60 * 60 * 1000
  if (now - date < oneDayMs * 2) {
    if (
      date.getDate() === now.getDate() - 1 &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      // 昨天
      const ampm = date.getHours() >= 12 ? '下午' : '上午'
      const hour = date.getHours() % 12 || 12
      const minute = date.getMinutes().toString().padStart(2, '0')
      return `昨天 ${ampm} ${hour}:${minute}`
    } else {
      // 前天
      const ampm = date.getHours() >= 12 ? '下午' : '上午'
      const hour = date.getHours() % 12 || 12
      const minute = date.getMinutes().toString().padStart(2, '0')
      return `前天 ${ampm} ${hour}:${minute}`
    }
  }

  // 不在两天内，判断是否在同一周
  const oneWeekMs = oneDayMs * 7
  const diffMs = now - date
  if (diffMs < oneWeekMs) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const ampm = date.getHours() >= 12 ? '下午' : '上午'
    const hour = date.getHours() % 12 || 12
    const minute = date.getMinutes().toString().padStart(2, '0')
    return `${days[date.getDay()]} ${ampm} ${hour}:${minute}`
  }

  // 不在同一周，显示具体年月日+时间
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const ampm = date.getHours() >= 12 ? '下午' : '上午'
  const hour = date.getHours() % 12 || 12
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${ampm} ${hour}:${minute}`
}

export const messageTypeMap: Record<string, MessageType> = {
  0: 'text',
  1: 'voice',
  2: 'image',
  3: 'video',
  4: 'file',
  5: 'redPacket',
  6: 'onlineVideo',
  7: 'onlineVoice',
  8: 'nameCard',
  9: 'poke',
  10: 'location',
  11: 'officialPush',
  12: 'note',
  13: 'audioFile',
  14: 'text',
  15: 'text',
  16: 'text'
}

export const messageTypeReverseMap: Record<MessageType, number> = {
  text: 0,
  voice: 1,
  image: 2,
  video: 3,
  file: 4,
  redPacket: 5,
  onlineVideo: 6,
  onlineVoice: 7,
  nameCard: 8,
  poke: 9,
  location: 10,
  officialPush: 11,
  note: 12,
  audioFile: 13
}

export const lastMessageTypeMap: Record<string, MessageType> = {
  text: '[文字]',
  voice: '[语音]',
  image: '[图片]',
  video: '[视频]',
  file: '[文件]',
  redPacket: '[红包]',
  onlineVideo: '[在线视频]',
  onlineVoice: '[在线语音]',
  nameCard: '[名片]',
  poke: '[戳一戳]',
  location: '[位置]',
  officialPush: '[官方推送]',
  note: '[笔记]',
  audioFile: '[音频文件]',
  text: '[文字]',
  text: '[文字]',
  text: '[文字]'
}

let timeout = null

export function debounce(func, wait = 500, immediate = false) {
  // 清除定时器
  if (timeout !== null) clearTimeout(timeout)
  // 立即执行，此类情况一般用不到
  if (immediate) {
    var callNow = !timeout
    timeout = setTimeout(function () {
      timeout = null
    }, wait)
    if (callNow) typeof func === 'function' && func()
  } else {
    // 设置定时器，当最后一次操作后，timeout不会再被清除，所以在延时wait毫秒后执行func回调方法
    timeout = setTimeout(function () {
      typeof func === 'function' && func()
    }, wait)
  }
}

interface IOptions {
  title?: string
  text: string
  icon?: 'success' | 'info' | 'warning' | 'error' | 'question'
  timer?: number
}

export function showToast(options: IOptions) {
  Swal.fire({
    title: options.title || '系统提示',
    text: options.text,
    icon: options.icon || 'success',
    timer: options.timer || 1500
  }).then(res => {})
}

export function showModal(options: IOptions) {
  return Swal.fire({
    title: options.title || '系统提示',
    text: options.text,
    icon: options.icon || 'success'
  })
}

export type Options<Result> = {
  isImmediate?: boolean
  maxWait?: number
  callback?: (data: Result) => void
}

export interface DebouncedFunction<
  Args extends any[],
  F extends (...args: Args) => any
> {
  (this: ThisParameterType<F>, ...args: Args & Parameters<F>): Promise<
    ReturnType<F>
  >

  cancel: (reason?: any) => void
}

interface DebouncedPromise<FunctionReturn> {
  resolve: (result: FunctionReturn) => void
  reject: (reason?: any) => void
}

export function debounceV2<
  Args extends any[],
  F extends (...args: Args) => any
>(
  func: F,
  waitMilliseconds = 50,
  options: Options<ReturnType<F>> = {}
): DebouncedFunction<Args, F> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const isImmediate = options.isImmediate ?? false
  const callback = options.callback ?? false
  const maxWait = options.maxWait
  let lastInvokeTime = Date.now()

  let promises: DebouncedPromise<ReturnType<F>>[] = []

  function nextInvokeTimeout() {
    if (maxWait !== undefined) {
      const timeSinceLastInvocation = Date.now() - lastInvokeTime

      if (timeSinceLastInvocation + waitMilliseconds >= maxWait) {
        return maxWait - timeSinceLastInvocation
      }
    }

    return waitMilliseconds
  }

  const debouncedFunction = function (
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ) {
    const context = this
    return new Promise<ReturnType<F>>((resolve, reject) => {
      const invokeFunction = function () {
        timeoutId = undefined
        lastInvokeTime = Date.now()
        if (!isImmediate) {
          const result = func.apply(context, args)
          callback && callback(result)
          promises.forEach(({ resolve }) => resolve(result))
          promises = []
        }
      }

      const shouldCallNow = isImmediate && timeoutId === undefined

      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(invokeFunction, nextInvokeTimeout())

      if (shouldCallNow) {
        const result = func.apply(context, args)
        callback && callback(result)
        return resolve(result)
      }
      promises.push({ resolve, reject })
    })
  }

  debouncedFunction.cancel = function (reason?: any) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    promises.forEach(({ reject }) => reject(reason))
    promises = []
  }

  return debouncedFunction
}

export function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: contentType })
}

export function doCopyImg2Clipboard(src) {
  if (!src) {
    return
  }
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.onload = ev => {
    // 原图尺寸
    const { naturalWidth, naturalHeight } = ev.target

    if (!naturalWidth) {
      console.log('图片尚未成功加载')
      return
    }

    // 绘制图片到canvas上
    const canvas = document.createElement('canvas')
    canvas.width = naturalWidth
    canvas.height = naturalHeight
    // canvas绘制上下文
    const context = canvas.getContext('2d')
    // 图片绘制
    context.drawImage(image, 0, 0, naturalWidth, naturalHeight)
    // 转为Blob数据
    canvas.toBlob(blob => {
      // 使用剪切板API进行复制
      const data = [
        new ClipboardItem({
          ['image/png']: blob,
        }),
      ]

      navigator.clipboard
        .write(data)
        .then(res => {
          console.log('res', res)
        })
        .catch(reason => {
          console.log('reason', reason)
        })
    })
  }
  image.src = src
}

export function doCopyImgBase64Clipboard(
  src,
  success = () => {},
  failure = () => {}
) {
  if (!src) {
    return
  }

  fetch(src)
    .then(response => response.blob())
    .then(blob => {
      // blob数据转base64
      const reader = new FileReader()
      reader.onload = function () {
        navigator.clipboard.writeText(this.result).then(success, failure)
      }
      reader.readAsDataURL(blob)
    })
}