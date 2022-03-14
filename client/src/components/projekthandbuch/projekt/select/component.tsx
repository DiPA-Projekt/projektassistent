import { Form, Select } from 'antd';
import React, { Component } from 'react';

import { ReactComponent } from '@leanup/lib/components/react';

import { SelectValue } from 'antd/es/select';
import { PopoverComponent } from '../popover/component';

import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import parse from 'html-react-parser';
import { decodeXml } from '../../../../shares/utils';

const { Option } = Select;

const layout = {
  labelCol: { span: 16 },
  wrapperCol: { span: 8 },
};

interface FeatureProps {
  projectFeature: ProjectFeature;
}

export class SelectComponent extends ReactComponent<FeatureProps, any> implements Component {
  public constructor(props: FeatureProps) {
    super(props);
    this.state = { value: this.getAnswer(this.props.projectFeature.values?.selectedValue) };
  }

  public render(): JSX.Element {
    const labelWithPopover = (
      <div>
        <span style={{ marginRight: '5px' }}>{this.props.projectFeature.description}</span>
        {this.props.projectFeature?.helpText !== undefined && (
          <>
            <PopoverComponent content={this.props.projectFeature.helpText} title={this.props.projectFeature.name} />
          </>
        )}
      </div>
    );

    return (
      <Form.Item
        {...layout}
        key={`${this.props.projectFeature.name}-${this.props.projectFeature.id}`}
        label={labelWithPopover}
      >
        <Select
          defaultValue={this.props.projectFeature.values?.selectedValue}
          onChange={(value: SelectValue) => {
            this.setState({ value: this.getAnswer(value) });
          }}
        >
          {this.props.projectFeature.values?.possibleValues?.map((value: { key: string; title: string }) => (
            // wir müssen als Key in der API einen anderen Datentype wählen / oder mappen
            <Option key={value.key} value={value.key}>
              {value.title}
            </Option>
          ))}
        </Select>
        <div style={{ fontWeight: 500, marginTop: '5px' }}>{parse(decodeXml(this?.state.value))}</div>
      </Form.Item>
    );
  }

  private getAnswer(value: SelectValue): string | undefined {
    const selectedValue = this.props.projectFeature.values?.possibleValues?.find((x) => x.key === value);
    return selectedValue?.answer;
  }
}
