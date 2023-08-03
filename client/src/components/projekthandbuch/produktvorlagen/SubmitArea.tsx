import { Button, Checkbox, Form, Input, Modal, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTemplate } from '../../../context/TemplateContext';
import { SingleProduct, StatusApi } from '@dipa-projekt/projektassistent-openapi';
import { Subscription } from 'rxjs';
import { ProductsApi } from '@dipa-projekt/projektassistent-openapi/dist/apis/ProductsApi';
import { MultiProducts } from '@dipa-projekt/projektassistent-openapi/dist/models/MultiProducts';
import { ProductOfProject } from '@dipa-projekt/projektassistent-openapi/dist/models';

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
    const status = statusApi.getStatus();
    console.log('status', status);
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

  function collectDataByProduct(values: {
    participants: string;
    projectName: string;
    responsible: string;
  }): SingleProduct | MultiProducts | undefined {
    const productsMap = new Map<string, ProductOfProject>();

    for (const checkedKey of checkedKeys) {
      const topic = topicsMap.get(checkedKey);
      if (topic) {
        if (!productsMap.has(topic.product.id)) {
          productsMap.set(topic.product.id, {
            productName: topic.product.title,
            responsible: values.responsible,
            participants: values.participants ? [values.participants] : [],
            chapters: [],
          });
        }
        productsMap.get(topic.product.id)!.chapters.push(topic.topic);
      }
    }

    const products: ProductOfProject[] = [];

    if (productsMap.size > 0) {
      for (const productKey of productsMap.keys()) {
        const product = productsMap.get(productKey);
        if (product) {
          products.push(product);
        }
      }
      if (products.length > 1) {
        return {
          projectName: values.projectName,
          products: products,
        } as MultiProducts;
      } else {
        const singleProductOfProject = products[0];
        const singleProduct = Object.assign(singleProductOfProject, {
          projectName: values.projectName,
        }) as SingleProduct;
        return singleProduct;
      }
    }
    return undefined;
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

    const productsApi = new ProductsApi();

    const bodyData = collectDataByProduct(values);
    if (bodyData.hasOwnProperty('products')) {
      productsApi.getZipForMultiProducts({ multiProducts: bodyData as MultiProducts }).subscribe((data: any) => {
        console.log('getZipForMultiProducts', data);
        downloadFile(data);
      });
    } else {
      productsApi.getDocxForSingleProduct({ singleProduct: bodyData as SingleProduct }).subscribe((data: any) => {
        console.log('getDocxForSingleProduct', data);
        downloadFile(data);
      });
    }

    console.log('status', status);
    statusSubscription = statusApi.getStatus().subscribe((data: any) => {
      console.log('statusSubscription', data);
    });
  };

  function downloadFile(response: Blob) {
    const downloadUrl = window.URL.createObjectURL(response);
    const link = document.createElement('a');
    link.href = downloadUrl;

    // const contentDisposition = response.headers['content-disposition'];
    const contentDispositionMatch = 'file.zip'; // TODO
    // if (contentDisposition) {
    //   const match = /filename=*(.+)/;
    //   const filename = contentDisposition.match(match);
    //   if (filename && filename.length > 1) {
    //     contentDispositionMatch = filename[1];
    //   }
    // }
    link.setAttribute('download', contentDispositionMatch);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

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
