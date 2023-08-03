import { Form, Select } from 'antd';
import React, { Component } from 'react';

import { SelectValue } from 'antd/es/select';
import { PopoverComponent } from '../popover/component';

// import { ProjectFeature } from '@dipa-projekt/projektassistent-openapi';
import parse from 'html-react-parser';
import { decodeXml } from '../../../../shares/utils';
import { ProjectFeature } from '../project';

const { Option } = Select;

const layout = {
  labelCol: { span: 16 },
  wrapperCol: { span: 8 },
};

interface FeatureProps {
  projectFeature: ProjectFeature;
  defaultValue?: string;
  onChange?: Function;
}

export class SelectComponent extends Component<FeatureProps, any> {
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

    console.log('render Select', this.state);

    return (
      <Form.Item
        {...layout}
        key={`${this.props.projectFeature.name}-${this.props.projectFeature.id}`}
        label={labelWithPopover}
      >
        <Select
          value={this.props.defaultValue}
          onChange={(value: SelectValue) => {
            this.setState({ value: this.getAnswer(value) });
            if (this.props.onChange) {
              this.props.onChange(this.props.projectFeature.id, value);
            }
          }}
        >
          {this.props.projectFeature.values?.possibleValues?.map(
            (value: { key: string; title: string; answer: string }) => (
              // wir müssen als Key in der API einen anderen Datentyp wählen / oder mappen
              <Option key={value.key} value={value.key}>
                {value.title}
              </Option>
            )
          )}
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
