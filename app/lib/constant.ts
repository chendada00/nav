import type { Social } from '~/lib/type'

/**
 * @description: 底部备案
 */
export const FooterRecord: Social[] = [
  {
    icon: 'icp.png',
    url: 'https://beian.miit.gov.cn/#/Integrated/index',
    tip: '京ICP备2022017849号-3'
  }
]

/**
 * @description: 社交图标
 */
export const FooterSocial: Social[] = [
  {
      icon: 'ri:bar-chart-2-line',
      url: 'https://um.baiwumm.com/share/3kXaMUYbKgUFkphU',
      tip: '网站统计'
  },
  { icon: 'i-ri-github-line', url: 'https://github.com/chendada00/', tip: 'Github' },
  // { icon: 'i-ri-mail-line', url: 'mailto:me@baiwumm.com', tip: 'Email' },
  { icon: 'i-ri-quill-pen-line', url: 'https://blog.伴随.cn', tip: '博客' }
  // { icon: 'mdi:api', url: 'https://api.baiwumm.com', tip: 'Easy Api' }
]
