import { Popover } from 'antd';
import React, { Component } from 'react';

import { ReactComponent } from '@leanup/lib/components/react';

import { QuestionCircleTwoTone } from '@ant-design/icons';

export class PopoverComponent extends ReactComponent<any, any> implements Component {
  public render(): JSX.Element {
    return (
      <>
        <Popover content={this.props?.content as string} title={this.props?.title as string}>
          <QuestionCircleTwoTone style={{ cursor: 'help' }} />
        </Popover>
      </>
    );
  }
}
