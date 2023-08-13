import { Button, Checkbox, Form, Tag } from 'antd';
import React, { useState } from 'react';
import { useTemplate } from '../../../context/TemplateContext';
import { OperationOpts, SingleProduct } from '@dipa-projekt/projektassistent-openapi';
import { MultiProducts } from '@dipa-projekt/projektassistent-openapi/dist/models/MultiProducts';
import { ProductOfProject } from '@dipa-projekt/projektassistent-openapi/dist/models';
import API from '../../../api';
import { AjaxResponse } from 'rxjs/ajax';
import { TemplateFormModal } from './TemplateFormModal';

export function SubmitArea() {
  const { checkedKeys, topicsMap } = useTemplate();

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState<ProductOfProject[]>([]);

  const buttonItemLayout = {
    wrapperCol: {
      span: 16,
      offset: 2,
    },
  };

  function collectDataForSingleProduct(values: {
    projectName: string;
    responsible: string;
    participants: string[];
  }): SingleProduct {
    return Object.assign(selectedProducts[0], {
      projectName: values.projectName,
      responsible: values.responsible,
      participants: values.participants,
    }) as SingleProduct;
  }

  function collectDataForMultiProducts(values: { projectName: string }): MultiProducts {
    return {
      projectName: values.projectName,
      products: selectedProducts,
    } as MultiProducts;
  }

  function doSubmit(): void {
    setModalVisible(true);

    const productsMap = new Map<string, ProductOfProject>();

    for (const checkedKey of checkedKeys) {
      const topic = topicsMap.get(checkedKey);
      if (topic) {
        if (!productsMap.has(topic.product.id)) {
          productsMap.set(topic.product.id, {
            productName: topic.product.title,
            responsible: '',
            participants: [],
            chapters: [],
          });
        }
        const currentProductsMap = productsMap.get(topic.product.id);
        if (currentProductsMap) {
          currentProductsMap.chapters.push(topic.topic);
        }
      }
    }

    const products: ProductOfProject[] = [];

    for (const productKey of productsMap.keys()) {
      const product = productsMap.get(productKey);
      if (product) {
        products.push(product);
      }
    }

    setSelectedProducts(products);
  }

  const handleClose = (values: { projectName: string; responsible: string; participants: string[] }) => {
    console.log('Received values of form: ', values);

    setModalVisible(false);

    if (values) {
      const opts: OperationOpts = { responseOpts: { response: 'raw' } };

      if (selectedProducts.length > 1) {
        API.ProductsApi.getZipForMultiProducts(
          {
            multiProducts: collectDataForMultiProducts(values),
          },
          opts
        ).subscribe((response: AjaxResponse<Blob>) => {
          downloadFile(response);
        });
      } else {
        API.ProductsApi.getDocxForSingleProduct(
          {
            singleProduct: collectDataForSingleProduct(values),
          },
          opts
        ).subscribe((response: AjaxResponse<Blob>) => {
          downloadFile(response);
        });
      }
    }
  };

  function downloadFile(response: AjaxResponse<Blob>) {
    const downloadUrl = window.URL.createObjectURL(response.response);
    const link = document.createElement('a');
    link.href = downloadUrl;

    const contentDisposition = response.responseHeaders['content-disposition'];
    let contentDispositionMatch = 'file.zip';
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
        {/*TODO: reinsert if there are Mustertexte available*/}
        {/*<Form.Item style={{ marginTop: '30px' }}>*/}
        {/*  <Checkbox>*/}
        {/*    <Tag color="red">Mustertexte</Tag> einfügen*/}
        {/*  </Checkbox>*/}
        {/*</Form.Item>*/}
        <Form.Item>
          <Checkbox>Themenbeschreibungen einfügen</Checkbox>
        </Form.Item>
        <Form.Item {...buttonItemLayout}>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => doSubmit()}
            style={{ marginRight: '8px', marginTop: '20px' }}
            disabled={checkedKeys.length === 0}
          >
            Vorlagen erzeugen
          </Button>
        </Form.Item>
      </div>

      <TemplateFormModal products={selectedProducts} open={modalVisible} handleClose={handleClose} />
    </>
  );
}
