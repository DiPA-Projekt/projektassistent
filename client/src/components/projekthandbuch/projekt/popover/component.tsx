import { Empty, Popover } from 'antd';
import React from 'react';

import { QuestionCircleTwoTone } from '@ant-design/icons';

export interface PopoverProps {
  content?: string;
  title: string;
}

export function PopoverComponent(props: PopoverProps): JSX.Element {
  return (
    <Popover content={props?.content ? props.content : <Empty />} title={props.title}>
      <QuestionCircleTwoTone style={{ cursor: 'help' }} />
    </Popover>
  );
}
