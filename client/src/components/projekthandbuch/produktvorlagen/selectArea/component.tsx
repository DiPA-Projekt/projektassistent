import React, { Component } from 'react';
import { Button, Checkbox, Form, Tag } from 'antd';
// import { ReactComponent } from '@leanup/lib';
// import { GenericComponent } from '@leanup/lib';
import { SelectAreaController } from './controller';
// import { CheckboxChangeEvent } from 'antd/es/checkbox';

const onReset = () => {
  // console.log('reset');
};

export class SelectAreaComponent extends Component<unknown, SelectAreaController> {
  // public readonly ctrl: SelectAreaController;

  public constructor(props: unknown) {
    super(props);
    // this.ctrl = new SelectAreaController(this.forceUpdate.bind(this));
  }

  public componentDidMount(): void {
    // this.ctrl.onInit();
  }

  public componentWillUnmount(): void {
    // this.ctrl.onDestroy();
  }

  public render(): JSX.Element {
    const buttonItemLayout = {
      wrapperCol: {
        span: 16,
        offset: 2,
      },
    };

    // const onChangeAllProductTemplates = (e: CheckboxChangeEvent) => {
    //   props.onChangeProductTemplates(e);
    //   // setCheckedList(e.target.checked ? plainOptions : []);
    //   setIndeterminateProductTemplates(false);
    //   setCheckAllProductTemplates(e.target.checked);
    // };

    return (
      <>
        <div className="sticky-wrapper" style={{ padding: '24px' }}>
          <Form.Item
            className={'normalWrap'}
            name="showAllSwitch"
            label="Auch Elemente zeigen, die für das Projekt nicht relevant sind"
            valuePropName="checked"
            labelAlign={'right'}
          >
            {/*<Switch*/}
            {/*  size="small"*/}
            {/*  onChange={(e: boolean) => {*/}
            {/*    this.ctrl.produktvorlagenService.setShowAll(e);*/}
            {/*  }}*/}
            {/*  checked={this.ctrl.showAll}*/}
            {/*/>*/}
          </Form.Item>

          <div style={{ marginTop: '10px' }}>
            <Checkbox
            // indeterminate={indeterminateProductTemplates}
            // onChange={(e: CheckboxChangeEvent) => {
            //   this.ctrl.produktvorlagenService.setCheckAllProductTemplates(e.target.checked);
            // }}
            // checked={this.ctrl.checkAllProductTemplates}
            >
              Alle <Tag color="blue">Produktvorlagen</Tag>auswählen
            </Checkbox>
          </div>
          <div>
            <Checkbox
            // indeterminate={indeterminateSamples}
            // onChange={(e: CheckboxChangeEvent) => {
            //   this.ctrl.produktvorlagenService.setCheckAllSamples(e.target.checked);
            // }}
            // checked={this.ctrl.checkAllSamples}
            >
              Alle <Tag color="red">Mustertexte</Tag>auswählen
            </Checkbox>
          </div>
          <Form.Item style={{ marginTop: '30px' }}>
            <Checkbox>Themenbeschreibungen einfügen</Checkbox>
          </Form.Item>
          <Form.Item {...buttonItemLayout}>
            <Button type="primary" htmlType="submit" style={{ marginRight: '8px', marginTop: '20px' }}>
              Vorlagen erzeugen
            </Button>
            <Button htmlType="button" onClick={onReset} style={{ marginTop: '20px' }}>
              Zurücksetzen
            </Button>
          </Form.Item>
        </div>
      </>
    );
  }
}
