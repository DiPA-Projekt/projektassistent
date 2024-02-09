import { Button, Checkbox, Form } from 'antd';
import React, { useState } from 'react';
import { useTemplate } from '../../../context/TemplateContext';
import { OperationOpts, SingleProduct } from '@dipa-projekt/projektassistent-openapi';
import { MultiProducts } from '@dipa-projekt/projektassistent-openapi/dist/models/MultiProducts';
import { ProductOfProject } from '@dipa-projekt/projektassistent-openapi/dist/models';
import API from '../../../api';
import { AjaxResponse } from 'rxjs/ajax';
import { TemplateFormModal } from './TemplateFormModal';
import { useTranslation } from 'react-i18next';
import { BookTwoTone } from '@ant-design/icons';

export function SubmitArea() {
  const { t } = useTranslation();

  const { checkedKeys, productsMap, insertTopicDescription, setInsertTopicDescription } = useTemplate();

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

  function getChaptersWithSamplesData(
    topics: { title: string; text: string; samples: { id: string; title: string; text: string }[] }[]
  ): {
    text?: string;
    title: string;
    samplesText?: string;
  }[] {
    if (insertTopicDescription) {
      return topics.map(({ samples, ...keepAttrs }) => ({
        ...keepAttrs,
        text: keepAttrs.text,
        samplesText: samples
          .filter((sample) => checkedKeys.checked.includes(sample.id))
          .map((sample) => sample.text)
          .join('\n'),
      }));
    }
    return topics.map(({ samples, ...keepAttrs }) => ({
      ...keepAttrs,
      text: samples.map((sample) => sample.text).join('\n'),
    }));
  }

  function doSubmit(): void {
    setModalVisible(true);

    const productOfProjectMap = new Map<string, ProductOfProject>();

    for (const checkedKey of checkedKeys.checked) {
      const product = productsMap.get(checkedKey);
      if (product) {
        productOfProjectMap.set(product.product.id, {
          productName: product.product.title,
          disciplineName: product.discipline.title,
          responsible: '',
          participants: [],
          chapters: getChaptersWithSamplesData(product.topics),
          externalCopyTemplates: product.externalCopyTemplates.filter((externalCopyTemplate) =>
            checkedKeys.checked.includes(externalCopyTemplate.id)
          ),
        });
      }
    }

    const products: ProductOfProject[] = [];

    for (const productKey of productOfProjectMap.keys()) {
      const product = productOfProjectMap.get(productKey);
      if (product) {
        products.push(product);
      }
    }

    setSelectedProducts(products);
  }

  const handleClose = (values: { projectName: string; responsible: string; participants: string[] }) => {
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

  function onChangeInsertTopicDescription() {
    setInsertTopicDescription(!insertTopicDescription);
  }

  return (
    <>
      <div className="sticky-wrapper" style={{ padding: '24px' }}>
        <Form.Item style={{ marginBottom: '0' }}>
          <Checkbox checked={insertTopicDescription} onChange={onChangeInsertTopicDescription}>
            <BookTwoTone twoToneColor="#389e0d" style={{ marginRight: '5px' }} />
            {t('text.insertTopicDescription')}
          </Checkbox>
        </Form.Item>
        <Form.Item {...buttonItemLayout}>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => doSubmit()}
            style={{ marginRight: '8px', marginTop: '20px' }}
            disabled={checkedKeys?.checked?.length === 0}
          >
            Vorlagen erzeugen
          </Button>
        </Form.Item>
      </div>

      <TemplateFormModal products={selectedProducts} open={modalVisible} handleClose={handleClose} />
    </>
  );
}
