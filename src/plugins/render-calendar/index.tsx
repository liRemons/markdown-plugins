import React, { useMemo } from 'react';
import { Calendar, type TodoRange, type DailySchedule } from 'remons-calendar';
import { createContainerComponent } from '../../utils/parse-container-config';
import { typeToIcon } from '../../utils/type-to-icon';
import { getConfig, log, type CalendarIconConfig } from '../../config';
import 'remons-calendar/style.css';
import './index.less';

interface CalendarProps {
  /**
   * 待办列表,markdown 里直接以数组字面量书写即可:
   * `:::calendar\n{ todos: [{...}], schedules: [{...}] }\n:::`
   */
  todos?: TodoRange[];
  schedules?: DailySchedule[];
  /**
   * 日程可用图标表(容器级),优先于全局 `configure({ calendarIcons })`。
   * `schedules[].icon` 按 `key` 在此表里查找。未传时依优先级回退。
   */
  icons?: CalendarIconConfig[];
  /**
   * v1 旧写法:整段 JSON 字符串包装 `{ value: '{"todos":[...],"schedules":[...]}' }`。
   * v2 起不推荐,但为兼容线上存量内容仍支持,优先级低于顶层 todos/schedules。
   */
  value?: string | Record<string, unknown>;
}

/** 未配置 icons 时的内置默认图标表(第三级兼底) */
const DEFAULT_CALENDAR_ICONS: CalendarIconConfig[] = [
  { key: 'hotel', type: 'hotel', tip: '酒店' },
  { key: 'attraction', type: 'highlightAttraction', tip: '景点' },
  { key: 'transport', type: 'travelMethod', tip: '交通' },
  { key: 'food', type: 'price', tip: '餐饮' },
];

/** CalendarIconConfig[] -> remons-calendar 需要的 IconItem[] */
function toIconItems(configs: CalendarIconConfig[]) {
  return configs
    .filter((c) => c && typeof c.key === 'string')
    .map((c) => ({
      key: c.key,
      icon: c.type ? typeToIcon(c.type) : c.emoji ?? '',
      tip: c.tip ?? c.key,
    }));
}

interface ResolvedData {
  todos: TodoRange[];
  schedules: DailySchedule[];
}

/**
 * 归一化日历数据:优先顶层数组(v2),回退 `value` 包装(v1)。
 * `value` 可能是 JSON 字符串,也可能被 JSON5 直接解成对象,两种都处理。
 */
function resolveCalendarData({ todos, schedules, value }: CalendarProps): ResolvedData {
  const hasTopLevel = Array.isArray(todos) || Array.isArray(schedules);
  if (hasTopLevel || !value) {
    return {
      todos: Array.isArray(todos) ? todos : [],
      schedules: Array.isArray(schedules) ? schedules : [],
    };
  }

  let parsed: Record<string, unknown> | null = null;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      log.warn('[calendar] 旧版 value 字符串 JSON.parse 失败:', e);
    }
  } else if (value && typeof value === 'object') {
    parsed = value;
  }

  // v1 value 里的数据不受编译期校验,按字段契约强转成包导出的真实类型。
  return {
    todos: (Array.isArray(parsed?.todos) ? parsed!.todos : []) as TodoRange[],
    schedules: (Array.isArray(parsed?.schedules) ? parsed!.schedules : []) as DailySchedule[],
  };
}

const CalendarContainerInner: React.FC<CalendarProps> = (props) => {
  // 派生数据 useMemo 缓存：避免父级重渲染时向重型 <Calendar> 传递新建的
  // icons/todos/schedules 数组引用，使其内部 memo 失效而整表重渲染
  const { todos, schedules, iconItems } = useMemo(() => {
    const data = resolveCalendarData(props);
    const globalIcons = getConfig().calendarIcons;
    const iconConfigs =
      Array.isArray(props.icons) && props.icons.length > 0
        ? props.icons
        : Array.isArray(globalIcons) && globalIcons.length > 0
          ? globalIcons
          : DEFAULT_CALENDAR_ICONS;
    return {
      todos: data.todos,
      schedules: data.schedules,
      iconItems: toIconItems(iconConfigs),
    };
  }, [props.todos, props.schedules, props.value, props.icons]);

  return <Calendar icons={iconItems} todos={todos} schedules={schedules} isPreview />;
};

const CalendarContainer = React.memo(CalendarContainerInner);

export default createContainerComponent('calendar')(CalendarContainer);
