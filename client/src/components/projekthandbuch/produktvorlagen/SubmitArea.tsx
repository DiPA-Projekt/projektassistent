import { Button, Checkbox, Form, Input, Modal, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTemplate } from '../../../context/TemplateContext';
import axios from 'axios';
import { StatusApi } from '@dipa-projekt/projektassistent-openapi';
import { Subscription } from 'rxjs';

export function SubmitArea() {
  const { selectedProducts, selectedTopics, checkedKeys, topicsMap } = useTemplate();

  let statusSubscription: Subscription = new Subscription();

  const [modalVisible, setModalVisible] = useState(false);
  const [formTitle, setFormTitle] = useState();
  const [confirmLoading, setConfirmLoading] = useState();

  const [responsible, setResponsible] = useState<string>();
  const [projectName, setProjectName] = useState<string>();
  const [participants, setParticipants] = useState<string[]>([]);

  const statusApi = new StatusApi();

  useEffect(() => {
    statusSubscription = statusApi.getStatus().subscribe((data: any) => {
      console.log('statusSubscription', data);
    });

    return () => {
      statusSubscription.unsubscribe();
    };
  }, []);

  function onReset() {
    console.log('reset');
  }

  const buttonItemLayout = {
    wrapperCol: {
      span: 16,
      offset: 2,
    },
  };

  function collectDataByProduct(values: any): any {
    const productsMap = new Map<
      string,
      {
        productName: string;
        responsible?: string;
        participants: string[];
        chapters: { title: string; text: string }[];
      }
    >();

    for (const checkedKey of checkedKeys) {
      const topic = topicsMap.get(checkedKey);
      if (topic) {
        if (!productsMap.has(topic.product.id)) {
          productsMap.set(topic.product.id, {
            productName: topic.product.title,
            responsible: values.responsible,
            participants: values.participants ?? [],
            chapters: [],
          });
        }
        productsMap.get(topic.product.id)!.chapters.push(topic.topic);
      }
    }

    const products: any[] = [];

    if (productsMap.size > 0) {
      for (const productKey of productsMap.keys()) {
        const product = productsMap.get(productKey);
        if (product) {
          products.push({
            productName: product.productName,
            responsible: product.responsible,
            participants: product.participants,
            chapters: product.chapters,
          });
        }
      }
      if (products.length > 1) {
        return {
          projectName: values.projectName,
          products: products,
        };
      } else {
        return Object.assign(products[0], { projectName: values.projectName });
      }
    }
  }

  function doSubmit(): void {
    setModalVisible(true);
  }

  const handleCancel = (values) => {
    console.log('Received values of form: ', values);
    setModalVisible(false);
  };

  const handleOk = (values: any) => {
    console.log('Received values of form: ', values);

    setProjectName(values.projectName);
    setResponsible(values.responsible);
    setParticipants(values.participants);

    setModalVisible(false);

    let url;

    const bodyData = collectDataByProduct(values);
    if (bodyData.hasOwnProperty('products')) {
      url = 'http://localhost:9081/api/v1/products';
    } else {
      url = 'http://localhost:9081/api/v1/product';
    }

    axios
      .post(url, bodyData, {
        responseType: 'blob',
      })
      .then((response) => {
        console.log(response);

        const downloadUrl = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = downloadUrl;

        const contentDisposition = response.headers['content-disposition'];
        let contentDispositionMatch = 'file.zip'; // TODO
        if (contentDisposition) {
          const match = /filename=*(.+)/;
          const filename = contentDisposition.match(match);
          if (filename && filename.length > 1) {
            contentDispositionMatch = filename[1];
          }
        }
        link.setAttribute('download', contentDispositionMatch);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(() => 'obligatory catch');
  };

  return (
    <>
      <div className="sticky-wrapper" style={{ padding: '24px' }}>
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
        <Form.Item style={{ marginTop: '30px' }}>
          <Checkbox>
            <Tag color="red">Mustertexte</Tag> einfügen
          </Checkbox>
        </Form.Item>
        <Form.Item>
          <Checkbox>Themenbeschreibungen einfügen</Checkbox>
        </Form.Item>
        <Form.Item {...buttonItemLayout}>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => doSubmit()}
            style={{ marginRight: '8px', marginTop: '20px' }}
          >
            Vorlagen erzeugen
          </Button>
          <Button htmlType="button" onClick={onReset} style={{ marginTop: '20px' }}>
            Zurücksetzen
          </Button>
        </Form.Item>
      </div>

      <Modal
        title={formTitle}
        visible={modalVisible}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
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
          onFinish={handleOk}
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
          <Form.Item
            name="responsible"
            label="Verantwortlich"
            rules={[
              {
                required: true,
                message: 'Bitte geben Sie einen Verantwortliche ein.',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="participants" label="Mitwirkend">
            <Input />
          </Form.Item>
          <Form.Item name="modifier" className="collection-create-form_last-form-item">
            <Button key="submit" type="primary" loading={confirmLoading} htmlType="submit">
              Erzeugen
            </Button>
            <Button key="cancel" type="default" htmlType="button">
              Abbrechen
            </Button>
            <Button key="reset" type="ghost" htmlType="reset">
              Zurücksetzen
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
