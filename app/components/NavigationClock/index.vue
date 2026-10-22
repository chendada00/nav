<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Solar } from 'lunar-javascript'

interface ClockParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

// 固定使用中国标准时间，与项目当前配置的 Asia/Shanghai 一致
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

function getCurrentClockParts(): ClockParts {
  const parts = formatter.formatToParts(new Date())
  const values = Object.fromEntries(
    parts.map(part => [part.type, part.value]),
  )

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  }
}

// 1. 直接初始化当前时间，避免初始显示占位符
const now = ref<ClockParts>(getCurrentClockParts())

let timer: ReturnType<typeof setInterval> | undefined

function updateClock() {
  now.value = getCurrentClockParts()
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

const dateText = computed(() => {
  const { year, month, day } = now.value
  return `${year}-${pad(month)}-${pad(day)}`
})

const hourText = computed(() => pad(now.value.hour))
const minuteText = computed(() => pad(now.value.minute))
const secondText = computed(() => pad(now.value.second))

const lunarText = computed(() => {
  const { year, month, day } = now.value

  const lunar = Solar.fromYmd(year, month, day).getLunar()

  const weekdayNames = [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
  ]

  // 使用 UTC 计算星期，避免浏览器所在时区影响日期
  const weekday = new Date(
    Date.UTC(year, month - 1, day),
  ).getUTCDay()

  return [
    `${lunar.getYearInGanZhi()}年`,
    `${lunar.getMonthInGanZhi()}月`,
    `${lunar.getDayInGanZhi()}日`,
    `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    weekdayNames[weekday],
  ].join(' ')
})

onMounted(() => {
  // 对齐到下一秒，减少定时器启动时的相位偏差
  const delay = 1000 - Date.now() % 1000

  timer = setTimeout(() => {
    updateClock()

    timer = setInterval(updateClock, 1000)
  }, delay) as unknown as ReturnType<typeof setInterval>
})

onUnmounted(() => {
  if (timer !== undefined) {
    clearTimeout(timer)
    clearInterval(timer)
  }
})
</script>

<template>
  <div
    class="navigation-clock"
    role="timer"
    aria-label="中国标准时间与农历日期"
  >
    <div class="navigation-clock__time">
      <span class="navigation-clock__date">{{ dateText }}</span>

      <span class="navigation-clock__hour">{{ hourText }}</span>
      <span class="navigation-clock__colon">:</span>
      <span class="navigation-clock__minute">{{ minuteText }}</span>
      <span class="navigation-clock__colon">:</span>

      <Transition name="clock-second" mode="out-in">
        <span
          :key="secondText"
          class="navigation-clock__second"
        >
          {{ secondText }}
        </span>
      </Transition>
    </div>

    <div class="navigation-clock__lunar">
      {{ lunarText }}
    </div>
  </div>
</template>

<style scoped>
/* 样式保持不变 */
.navigation-clock {
  display: flex;
  min-width: 0;
  max-width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;

  color: var(--ui-text, inherit);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  user-select: none;
}

.navigation-clock__time {
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0.015em;
}

.navigation-clock__date {
  margin-right: 7px;
}

.navigation-clock__colon {
  padding: 0 1px;
  opacity: 0.65;
}

.navigation-clock__second {
  display: inline-block;
  width: 2ch;
  text-align: center;
  color: #8b78df;
}

.navigation-clock__lunar {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  font-size: 11px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: 0.01em;
  opacity: 0.8;
}

.clock-second-enter-active,
.clock-second-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.clock-second-enter-from {
  opacity: 0;
  transform: translateY(3px);
}

.clock-second-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

@media (prefers-reduced-motion: reduce) {
  .clock-second-enter-active,
  .clock-second-leave-active {
    transition: none;
  }
}
</style>