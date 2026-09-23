import React from 'react';
import { Calendar } from 'remons-calendar';
import { createContainerComponent } from '../../utils/parse-container-config';
import 'remons-calendar/style.css';
import './index.less';
import { typeToIcon } from 'src/utils/type-to-icon';

const CalendarContainerInner: React.FC<{ value?: string; isPreview?: string }> = ({ value, isPreview }) => {
  let todos: any[] = [];
  let schedules: any[] = [];

  if (value) {
    try {
      const parsed = JSON.parse(value);
      todos = parsed.todos || [];
      schedules = parsed.schedules || [];
    } catch (e) {
      console.warn('[calendar] Failed to parse value:', e);
    }
  }

  return (
    <Calendar
      icons={[
        {
          key: 'hotel',
          icon: typeToIcon('hotel'),
          tip: '酒店',
        }
      ]}
      todos={todos}
      schedules={schedules}
      isPreview
    />
  );
};

const CalendarContainer = React.memo(CalendarContainerInner);

export default createContainerComponent('calendar')(CalendarContainer);