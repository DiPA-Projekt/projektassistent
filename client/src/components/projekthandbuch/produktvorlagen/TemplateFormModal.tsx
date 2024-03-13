import { Button, Form, Input, Modal, Space } from 'antd';
import React from 'react';
import { ProductOfProject } from '@dipa-projekt/projektassistent-openapi/dist/models';
import { Tag, WithContext as ReactTags } from 'react-tag-input';

const KeyCodes = {
  enter: 13,
};

const delimiters = [KeyCodes.enter];

export function TemplateFormModal(props: PropTypes) {
  const [tags, setTags] = React.useState<Tag[]>([]);

  const handleDelete = (i: number) => {
    setTags(tags.filter((tag: Tag, index) => index !== i));
  };

  const handleAddition = (tag: Tag) => {
    setTags([...tags, tag]);
  };

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    setTags(newTags);
  };

  return (
    <Modal
      open={props.open}
      onCancel={() => props.handleClose(false)}
      footer={[]} //this to hide the default inputs of the modal
    >
      <Form
        layout="vertical"
        name="form_in_modal"
        initialValues={
          {
            // modifier: 'public',
          }
        }
        onFinish={(values: { projectName: string; responsible: string }) => {
          const result = tags.map((tag) => tag.text);
          props.handleClose({ ...values, participants: result });
        }}
      >
        <Form.Item
          name="projectName"
          label="Projektname"
          rules={[
            {
              required: true,
              message: 'Bitte geben Sie einen Projektnamen ein.',
            },
          ]}
        >
          <Input />
        </Form.Item>
        {props.products.length === 1 && (
          <>
            <Form.Item
              name="responsible"
              label="Verantwortlich"
              rules={[
                {
                  required: true,
                  message: 'Bitte geben Sie einen oder mehrere Verantwortliche ein.',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="participants" label="Mitwirkend">
              <ReactTags
                tags={tags}
                placeholder='Drücke "Enter" um Mitwirkenden einzufügen'
                delimiters={delimiters}
                handleDelete={handleDelete}
                handleAddition={handleAddition}
                handleDrag={handleDrag}
                inputFieldPosition="bottom"
                autocomplete
              />
            </Form.Item>
          </>
        )}
        <Space wrap>
          <Button key="submit" type="primary" htmlType="submit">
            Erzeugen
          </Button>
          <Button key="cancel" type="default" onClick={() => props.handleClose(false)} htmlType="button">
            Abbrechen
          </Button>
          <Button key="reset" type="ghost" htmlType="reset">
            Zurücksetzen
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}

export interface PropTypes {
  open: boolean;
  handleClose: Function;
  products: ProductOfProject[];
}
